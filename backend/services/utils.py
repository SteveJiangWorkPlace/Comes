from __future__ import annotations

import json
import re
import socket
import ssl
import urllib.error
import urllib.request
from typing import Any


def clean_asterisks(text: str) -> str:
    return text.replace("*", "") if text else ""


def contains_chinese(text: str) -> bool:
    return any("\u4e00" <= ch <= "\u9fff" for ch in (text or ""))


def filter_ai_greeting(text: str) -> str:
    patterns = [
        r"^好的，作为.*?顾问.*?\n+",
        r"^作为.*?顾问.*?\n+",
        r"^我将.*?分析.*?\n+",
        r"^下面我将.*?\n+",
    ]
    out = text or ""
    for pattern in patterns:
        out = re.sub(pattern, "", out, flags=re.DOTALL)
    return out


def parse_sections(full_response: str) -> list[dict[str, str]]:
    text = (full_response or "").strip()
    if not text:
        return []

    # Accept common marker variants: [[LOGIC]], [[LOG-IC]], [[LOG IC]], etc.
    logic_marker_re = re.compile(r"\[\[\s*LOG(?:\s*[-_ ]\s*IC|IC)\s*\]\]", flags=re.IGNORECASE)
    draft_marker_re = re.compile(r"\[\[\s*DRAFT\s*\]\]", flags=re.IGNORECASE)
    section_split_re = re.compile(r"\s*===\s*SECTION\s*===\s*", flags=re.IGNORECASE)

    raw_sections = [s for s in section_split_re.split(text) if s.strip()] if "SECTION" in text.upper() else [text]
    parsed: list[dict[str, str]] = []

    for sec in raw_sections:
        sec_text = sec.strip()
        if not sec_text:
            continue

        logic = ""
        draft = ""
        logic_match = logic_marker_re.search(sec_text)
        draft_match = draft_marker_re.search(sec_text)

        if logic_match and draft_match:
            # Keep order-safe extraction.
            if logic_match.start() < draft_match.start():
                logic = sec_text[logic_match.end() : draft_match.start()].strip()
                draft = sec_text[draft_match.end() :].strip()
            else:
                draft = sec_text[draft_match.end() : logic_match.start()].strip()
                logic = sec_text[logic_match.end() :].strip()
        elif draft_match:
            draft = sec_text[draft_match.end() :].strip()
        elif logic_match:
            logic = sec_text[logic_match.end() :].strip()
        else:
            # If markers are missing, treat the section as draft to avoid dropping content.
            draft = sec_text

        if logic or draft:
            parsed.append(
                {
                    "logic": logic.replace("Part 1:", "").strip(),
                    "draft": draft.replace("Part 2:", "").strip(),
                }
            )

    return parsed


def ndjson_line(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False) + "\n"


DEAI_BANNED_PATTERNS: list[tuple[str, str]] = [
    ("master", r"\bmaster(?:s|ed|ing)?\b"),
    ("mastery", r"\bmastery\b"),
    ("my goal is to", r"\bmy\s+goal\s+is\s+to\b"),
    ("hone", r"\bhon(?:e|es|ed|ing)\b"),
    ("permit", r"\bpermit(?:s|ted|ting)?\b"),
    ("deep comprehension", r"\bdeep\s+comprehension\b"),
    ("look forward to", r"\blook(?:ing)?\s+forward\s+to\b"),
    ("address", r"\baddress(?:es|ed|ing)?\b"),
    ("command", r"\bcommand(?:s|ed|ing)?\b"),
    ("drawn to", r"\bdrawn\s+to\b"),
    ("delve into", r"\bdelv(?:e|es|ed|ing)\s+into\b"),
    ("demonstrate", r"\bdemonstrat(?:e|es|ed|ing)\b"),
    ("draw", r"\bdraw(?:s|n|ing)?\b"),
    ("privilege", r"\bprivilege(?:d|s)?\b"),
    ("testament", r"\btestament(?:s)?\b"),
    ("commitment", r"\bcommitment(?:s)?\b"),
    ("tenure", r"\btenure(?:s)?\b"),
    ("thereby", r"\bthereby\b"),
    ("cultivate", r"\bcultivat(?:e|es|ed|ing)\b"),
    ("building on this", r"\bbuilding\s+on\s+this\b"),
    ("building on this foundation", r"\bbuilding\s+on\s+this\s+foundation\b"),
    ("intend to", r"\bintend(?:s|ed|ing)?\s+to\b"),
    ("endeavour", r"\bendeavou?r(?:s|ed|ing)?\b"),
    ("proficiency", r"\bproficien(?:cy|cies)\b"),
]


def detect_deai_violations(text: str) -> list[str]:
    src = text or ""
    low = src.lower()
    violations: list[str] = []

    # 1) Banned words/phrases (including common inflections).
    for label, pattern in DEAI_BANNED_PATTERNS:
        if re.search(pattern, low):
            violations.append(f"banned phrase: {label}")

    # 2) Forbidden -ing nominal patterns and participial tails.
    structural_rules = [
        (r"\bfor\s+[a-z]+ing\b", "for + V-ing pattern"),
        (r"\bby\s+[a-z]+ing\b", "by + V-ing pattern"),
        (r"(^|\n)\s*[A-Z][a-z]+ing\b[^.?!]*\bis\b", "gerund-like sentence subject"),
        (r",\s*[a-z]+ing\b", "comma + V-ing participial tail"),
    ]
    for pattern, label in structural_rules:
        if re.search(pattern, src):
            violations.append(f"forbidden structure: {label}")

    # 3) Markdown/meta formatting and obvious non-English output artifacts.
    if re.search(r"[*_`#>\\-]", src):
        violations.append("formatting: markdown symbol detected")
    # Reject non-Latin scripts in de-AI output (language must stay English).
    if re.search(r"[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]", src):
        violations.append("language: non-English script detected")
    if re.search(r"\b(feedback|revision|version\s*\d+|general feedback)\b", low):
        violations.append("meta output: feedback/revision style text")

    # Deduplicate while preserving order.
    deduped: list[str] = []
    seen: set[str] = set()
    for v in violations:
        if v not in seen:
            seen.add(v)
            deduped.append(v)
    return deduped


def network_diagnose(host: str = "generativelanguage.googleapis.com") -> dict[str, Any]:
    result: dict[str, Any] = {
        "host": host,
        "dns": {"ok": False, "ip": "", "ips": [], "error": ""},
        "tcp_443": {"ok": False, "error": ""},
        "https_handshake": {"ok": False, "error": ""},
        "https_request": {"ok": False, "status": 0, "error": ""},
    }

    try:
        infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
        ips: list[str] = []
        for info in infos:
            ip = info[4][0]
            if ip not in ips:
                ips.append(ip)
        primary_ip = ips[0] if ips else ""
        result["dns"] = {"ok": bool(ips), "ip": primary_ip, "ips": ips, "error": ""}
    except Exception as e:
        result["dns"] = {"ok": False, "ip": "", "ips": [], "error": str(e)}
        return result

    tcp_errors: list[str] = []
    handshake_errors: list[str] = []

    ips = result["dns"]["ips"] if isinstance(result["dns"]["ips"], list) else []
    tcp_ok_ip = ""
    for ip in ips:
        try:
            with socket.create_connection((ip, 443), timeout=5):
                tcp_ok_ip = ip
                break
        except Exception as e:
            tcp_errors.append(f"{ip}: {e}")

    if tcp_ok_ip:
        result["tcp_443"] = {"ok": True, "error": "", "ip": tcp_ok_ip}
    else:
        short_err = "; ".join(tcp_errors[:3]) if tcp_errors else "all attempts failed"
        result["tcp_443"] = {"ok": False, "error": short_err, "ip": ""}
        return result

    ctx = ssl.create_default_context()
    handshake_ok_ip = ""
    for ip in ips:
        try:
            with socket.create_connection((ip, 443), timeout=5) as sock:
                with ctx.wrap_socket(sock, server_hostname=host):
                    handshake_ok_ip = ip
                    break
        except Exception as e:
            handshake_errors.append(f"{ip}: {e}")

    if handshake_ok_ip:
        result["https_handshake"] = {"ok": True, "error": "", "ip": handshake_ok_ip}
    else:
        short_err = "; ".join(handshake_errors[:3]) if handshake_errors else "all attempts failed"
        result["https_handshake"] = {"ok": False, "error": short_err, "ip": ""}

    # This request follows Python's proxy env behavior and is closer to SDK behavior than raw socket probing.
    url = f"https://{host}/"
    req = urllib.request.Request(url=url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            result["https_request"] = {"ok": True, "status": int(getattr(resp, "status", 200) or 200), "error": ""}
    except urllib.error.HTTPError as e:
        # HTTPError still means TCP/TLS path is reachable.
        result["https_request"] = {"ok": True, "status": int(e.code), "error": ""}
    except Exception as e:
        result["https_request"] = {"ok": False, "status": 0, "error": str(e)}

    return result


def clean_parentheses(text: str) -> str:
    """
    Remove surrounding punctuation marks inside parentheses that were likely
    incorrectly included by the AI.
    """
    def clean_match(m):
        content = m.group(1)  # content inside parentheses
        # Remove leading/trailing punctuation (commas, periods, semicolons, etc.)
        # but only if the punctuation is at the very start/end of the content
        # and not part of the modified words.
        # We'll strip common punctuation from start and end
        leading_punct = re.match(r'^[，。、；：,.;:!?]+', content)
        if leading_punct:
            content = content[len(leading_punct.group(0)):]
        trailing_punct = re.search(r'[，。、；：,.;:!?]+$', content)
        if trailing_punct:
            content = content[:-len(trailing_punct.group(0))]
        # Return parentheses with cleaned content
        return m.group(0)[0] + content + m.group(0)[-1]

    # Match both half-width and full-width parentheses
    # Non-greedy match for content
    pattern = r'[（(]([^）)]*?)[）)]'
    return re.sub(pattern, clean_match, text)
