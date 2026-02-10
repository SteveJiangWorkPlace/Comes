import React from 'react'
import classNames from 'classnames'
import styles from './Icon.module.css'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  HomeOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
  CheckOutlined,
  WarningOutlined,
  InfoOutlined,
  LoadingOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  MessageOutlined,
  PhoneOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  CloudOutlined,
  WifiOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  PictureOutlined,
  FileOutlined,
  FolderOutlined,
  PaperClipOutlined,
  InboxOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CalculatorOutlined,
  CodeOutlined,
  BugOutlined,
  RocketOutlined,
  CrownOutlined,
  TrophyOutlined,
  GiftOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CarOutlined,
  ShopOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  KeyOutlined,
  TagOutlined,
  TagsOutlined,
  FlagOutlined,
  BellOutlined,
  NotificationOutlined,
  SoundOutlined,
  BulbOutlined,
  ToolOutlined,
  BuildOutlined,
  ExperimentOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  // Additional icons
  SyncOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  DesktopOutlined,
  HistoryOutlined,
  SaveOutlined,
  BookOutlined,
  UpOutlined,
  DownOutlined,
  // More icons
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  LinkOutlined,
  MoreOutlined,
  TeamOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  // Fallback icon
  QuestionCircleOutlined,
} from '@ant-design/icons'

// Icon name to component mapping
const iconComponents = {
  // User interface
  user: UserOutlined,
  lock: LockOutlined,
  mail: MailOutlined,
  home: HomeOutlined,
  settings: SettingOutlined,
  logout: LogoutOutlined,
  menuFold: MenuFoldOutlined,
  menuUnfold: MenuUnfoldOutlined,
  close: CloseOutlined,
  check: CheckOutlined,
  warning: WarningOutlined,
  info: InfoOutlined,
  loading: LoadingOutlined,
  plus: PlusOutlined,
  minus: MinusOutlined,
  edit: EditOutlined,
  delete: DeleteOutlined,
  copy: CopyOutlined,
  download: DownloadOutlined,
  upload: UploadOutlined,
  search: SearchOutlined,
  filter: FilterOutlined,
  sortAsc: SortAscendingOutlined,
  sortDesc: SortDescendingOutlined,
  calendar: CalendarOutlined,
  clock: FieldTimeOutlined,
  eye: EyeOutlined,
  eyeInvisible: EyeInvisibleOutlined,

  // Social
  star: StarOutlined,
  heart: HeartOutlined,
  share: ShareAltOutlined,
  message: MessageOutlined,
  phone: PhoneOutlined,
  global: GlobalOutlined,

  // Technology
  database: DatabaseOutlined,
  cloud: CloudOutlined,
  wifi: WifiOutlined,
  camera: CameraOutlined,
  video: VideoCameraOutlined,
  audio: AudioOutlined,
  picture: PictureOutlined,
  file: FileOutlined,
  folder: FolderOutlined,
  paperclip: PaperClipOutlined,
  inbox: InboxOutlined,
  appstore: AppstoreOutlined,
  dashboard: DashboardOutlined,

  // Analytics
  barChart: BarChartOutlined,
  pieChart: PieChartOutlined,
  lineChart: LineChartOutlined,

  // Development
  calculator: CalculatorOutlined,
  code: CodeOutlined,
  bug: BugOutlined,
  rocket: RocketOutlined,

  // Awards
  crown: CrownOutlined,
  trophy: TrophyOutlined,
  gift: GiftOutlined,

  // Miscellaneous
  fire: FireOutlined,
  thunderbolt: ThunderboltOutlined,
  car: CarOutlined,
  shop: ShopOutlined,
  bank: BankOutlined,
  medicine: MedicineBoxOutlined,
  safety: SafetyOutlined,
  key: KeyOutlined,
  tag: TagOutlined,
  tags: TagsOutlined,
  flag: FlagOutlined,
  bell: BellOutlined,
  notification: NotificationOutlined,
  sound: SoundOutlined,
  bulb: BulbOutlined,
  tool: ToolOutlined,
  build: BuildOutlined,
  experiment: ExperimentOutlined,
  compass: CompassOutlined,
  environment: EnvironmentOutlined,

  // New icons
  reload: SyncOutlined,
  'arrow-up': ArrowUpOutlined,
  activity: LineChartOutlined,
  setting: SettingOutlined, // alias for settings
  audit: AuditOutlined,
  monitor: DesktopOutlined,
  history: HistoryOutlined,
  save: SaveOutlined,
  chart: BarChartOutlined, // alias for barChart
  book: BookOutlined,
  hash: TagOutlined,
  'chevron-up': UpOutlined,
  'chevron-down': DownOutlined,

  // More icons
  refresh: SyncOutlined,
  files: FileOutlined,
  'file-text': FileTextOutlined,
  bold: BoldOutlined,
  italic: ItalicOutlined,
  underline: UnderlineOutlined,
  'unordered-list': UnorderedListOutlined,
  'ordered-list': OrderedListOutlined,
  link: LinkOutlined,
  more: MoreOutlined,
  team: TeamOutlined,
  print: PrinterOutlined,
  'arrow-left': ArrowLeftOutlined,

  // Fallback
  unknown: QuestionCircleOutlined,
} as const

export type IconName = keyof typeof iconComponents

export interface IconProps {
  /** Icon name */
  name: IconName
  /** Icon size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  /** Icon color */
  color?: string
  /** Icon variant */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  /** Whether icon is spinning */
  spin?: boolean
  /** Whether icon is rotating */
  rotate?: number
  /** Additional CSS class */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Style object */
  style?: React.CSSProperties
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  variant = 'default',
  spin = false,
  rotate,
  className,
  onClick,
  style,
}) => {
  const IconComponent = iconComponents[name] || iconComponents.unknown

  const iconClasses = classNames(
    styles.icon,
    styles[`variant-${variant}`],
    {
      [styles.clickable]: !!onClick,
      [styles.spin]: spin,
    },
    className
  )

  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }

  const iconSize = typeof size === 'number' ? size : sizeMap[size]

  const iconStyle = {
    color: color || undefined,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
    fontSize: `${iconSize}px`,
    ...style,
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <span
      className={iconClasses}
      onClick={onClick ? handleClick : undefined}
      style={iconStyle}
      role={onClick ? 'button' : 'img'}
      aria-label={name}
      tabIndex={onClick ? 0 : undefined}
    >
      <IconComponent />
    </span>
  )
}

// Export icon names for easy reference
export const ICON_NAMES = Object.keys(iconComponents) as IconName[]

export default Icon
