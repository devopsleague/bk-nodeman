import { authentication, defaultPort, sysOptions, defaultOsType, getDefaultConfig, addressingMode, DHCP_FILTER_KEYS } from '@/config/config';
import { reguFnMinInteger, reguPort, reguIPMixins, reguIp, reguIPv6 } from '@/common/form-check';

export const parentHead = [
  { label: '业务属性', prop: 'biz_attr', type: 'text', colspan: 0 },
  { label: '管控区域属性', prop: 'cloud_attr', type: 'text', colspan: 0 },
  { label: '主机IPTip', prop: 'host_ip', type: 'text', colspan: 0, required: true, tips: 'agentSetupHostIp' },
  { label: '主机属性', prop: 'host_attr', type: 'text', colspan: 0 },
  { label: '登录信息', prop: 'login_info', type: 'text', tips: 'agentSetupLoginInfo', colspan: 0 },
  { label: '传输信息', prop: 'trans_info', type: 'text', colspan: 0 },
  { label: '', prop: '', type: 'operate' },
];

const config = [
  {
    label: '业务',
    prop: 'bk_biz_id',
    type: 'biz',
    batch: true,
    required: true,
    noRequiredMark: false,
    multiple: false,
    parentProp: 'biz_attr',
    placeholder: window.i18n.t('选择业务'),
    manualProp: true,
  },
  {
    label: '管控区域',
    prop: 'bk_cloud_id',
    type: 'select',
    batch: true,
    searchable: true,
    required: true,
    noRequiredMark: false,
    popoverMinWidth: 160,
    placeholder: window.i18n.t('请选择'),
    parentProp: 'cloud_attr',
    permission: true,
    manualProp: true,
    getOptions() {
      return this.cloudList.map(item => ({
        name: item.bk_cloud_name,
        id: item.bk_cloud_id,
        permission: item.view,
        permissionType: 'cloud_view',
      }));
    },
    handleValueChange(row) {
      if (row.proxyStatus) {
        row.proxyStatus = '';
      }
      // 非直连区域的接入点不允许修改
      const cloud = this.cloudList.find(cloud => cloud.bk_cloud_id === row.bk_cloud_id);
      let defaultId = -1;
      // 手动安装时不能有自动选择
      if (this.isManual) {
        const defaultAp = this.apList.find(item => item.is_default);
        defaultId = defaultAp ? defaultAp.id : '';
      }
      if (cloud && cloud.bk_cloud_id !== window.PROJECT_CONFIG.DEFAULT_CLOUD) {
        row.ap_id = cloud.ap_id;
      } else {
        row.ap_id = defaultId;
      }
      if (row.install_channel_id !== 'default') {
        row.install_channel_id = '';
      }
      // windows 非直连区域的端口不允许修改
      if (!this.isManual && row.os_type === 'WINDOWS' && row.bk_cloud_id !== window.PROJECT_CONFIG.DEFAULT_CLOUD) {
        row.port = getDefaultConfig(row.os_type, 'port', 445);
      }
    },
    getProxyStatus(row) {
      return row.proxyStatus;
    },
  },
  {
    label: '安装通道',
    prop: 'install_channel_id',
    type: 'select',
    required: true,
    batch: true,
    popoverMinWidth: 160,
    noRequiredMark: false,
    placeholder: window.i18n.t('请选择'),
    parentProp: 'cloud_attr',
    manualProp: true,
    handleValueChange(row) {
      if (row.install_channel_id !== 'default' && row.bk_cloud_id === window.PROJECT_CONFIG.DEFAULT_CLOUD) {
        row.ap_id = this.apList.find(item => item.id !== -1)?.id || '';
      }
    },
    getOptions(row) {
      return row.bk_cloud_id || row.bk_cloud_id === 0
        ? this.channelList.filter(item => item.bk_cloud_id === row.bk_cloud_id || item.id === 'default')
        : this.channelList;
    },
  },
  {
    label: '接入点',
    prop: 'ap_id',
    type: 'select',
    batch: true,
    required: true,
    noRequiredMark: false,
    default: getDefaultConfig(defaultOsType, 'ap_id', -1),
    options: [],
    popoverMinWidth: 160,
    placeholder: window.i18n.t('请选择'),
    parentProp: 'cloud_attr',
    manualProp: true,
    getOptions(row) {
      return this.apList.map(item => ({
        ...item,
        disabled: item.id === -1
          && (row.bk_cloud_id !== window.PROJECT_CONFIG.DEFAULT_CLOUD || row.install_channel_id !== 'default'),
      }));
    },
    getReadonly(row) {
      // 手动安装时可以自由选择接入点
      return this.isManual ? false : row.bk_cloud_id && row.bk_cloud_id !== window.PROJECT_CONFIG.DEFAULT_CLOUD;
    },
  },
  {
    label: '内网IPv4',
    prop: 'inner_ip',
    type: 'text',
    required: true,
    requiredPick: ['inner_ipv6'],
    noRequiredMark: true,
    parentProp: 'host_ip',
    sync: 'login_ip',
    union: 'bk_cloud_id',
    unique: true,
    errTag: true,
    placeholder: window.i18n.t('请输入'),
    manualProp: true,
    rules: [reguIp,
      {
        trigger: 'blur',
        message: window.i18n.t('冲突校验', { prop: 'IP' }),
        validator(v, id) {
          // 与其他输入框的值不能重复
          if (!v) return true;
          const row = this.table.data.find(item => item.id === id);
          if (!row) return;
          return this.handleValidateUnique(row, { prop: 'inner_ip' });
        },
      },
    ],
  },

  {
    label: '内网IPv6',
    prop: 'inner_ipv6',
    type: 'text',
    required: true,
    requiredPick: ['inner_ip'],
    noRequiredMark: true,
    parentProp: 'host_ip',
    union: 'bk_cloud_id',
    unique: true,
    errTag: true,
    placeholder: window.i18n.t('请输入'),
    manualProp: true,
    rules: [reguIPv6,
      {
        trigger: 'blur',
        message: window.i18n.t('冲突校验', { prop: 'IP' }),
        validator(v, id) {
          // 与其他输入框的值不能重复
          if (!v) return true;
          const row = this.table.data.find(item => item.id === id);
          if (!row) return;
          return this.handleValidateUnique(row, { prop: 'inner_ipv6' });
        },
      },
    ],
  },
  {
    label: '操作系统',
    prop: 'os_type',
    type: 'select',
    batch: true,
    required: true,
    noRequiredMark: false,
    placeholder: window.i18n.t('请选择'),
    parentProp: 'host_attr',
    options: sysOptions,
    manualProp: true,
    handleValueChange(row) {
      row.port = getDefaultConfig(row.os_type, 'port', row.os_type === 'WINDOWS' ? 445 : defaultPort);
      row.account = getDefaultConfig(row.os_type, 'account', row.os_type === 'WINDOWS' ? 'Administrator' : 'root');
    },
  },
  {
    label: '寻址方式',
    prop: 'bk_addressing',
    type: 'select',
    default: 'static',
    batch: true,
    required: false,
    noRequiredMark: false,
    parentProp: 'host_attr',
    manualProp: true,
    getOptions() {
      return addressingMode;
    },
    width: 90,
  },
  {
    label: '登录端口',
    prop: 'port',
    type: 'text',
    required: true,
    noRequiredMark: false,
    batch: true,
    default: getDefaultConfig(defaultOsType, 'port', defaultPort),
    tips: 'agentSetupPort',
    parentProp: 'login_info',
    rules: [reguPort],
    // getReadonly(row) {
    //   return row && row.os_type === 'WINDOWS' && row.bk_cloud_id !== window.PROJECT_CONFIG.DEFAULT_CLOUD;
    // },
  },
  {
    label: '登录账号',
    prop: 'account',
    type: 'text',
    required: true,
    noRequiredMark: false,
    batch: true,
    tips: 'agentSetupLoginAccount',
    parentProp: 'login_info',
    default: getDefaultConfig(defaultOsType, 'account', 'root'),
  },
  {
    label: '认证方式',
    prop: 'auth_type',
    type: 'select',
    required: true,
    noRequiredMark: false,
    batch: true,
    subTitle: window.i18n.t('密钥方式仅对Linux/AIX系统生效'),
    parentProp: 'login_info',
    default: getDefaultConfig(defaultOsType, 'auth_type', 'PASSWORD'),
    getOptions(row) {
      return row.os_type === 'WINDOWS' ? authentication.filter(auth => auth.id !== 'KEY') : authentication;
    },
    handleValueChange(row) {
      const auth = authentication.find(auth => auth.id === row.auth_type) || {};
      row.prove = auth.default || '';
    },
  },
  {
    label: '密码/密钥',
    required: true,
    noRequiredMark: false,
    prop: 'prove',
    type: 'password',
    batch: true,
    tips: 'agentSetupKey',
    parentProp: 'login_info',
    subTitle: window.i18n.t('仅对密码认证生效'),
    placeholder: window.i18n.t('请输入'),
    getReadonly(row) {
      return row.auth_type && row.auth_type === 'TJJ_PASSWORD';
    },
    getCurrentType(row) {
      const auth = authentication.find(auth => auth.id === row.auth_type) || {};
      return auth.type || 'text';
    },
  },
  {
    label: '登录IP',
    prop: 'login_ip',
    type: 'text',
    required: false,
    noRequiredMark: false,
    placeholder: window.i18n.t('请输入'),
    tips: 'agentSetupLoginIp',
    parentProp: 'login_info',
    unique: true,
    errTag: true,
    manualProp: true,
    rules: [reguIPMixins,
      {
        trigger: 'blur',
        message: window.i18n.t('冲突校验', { prop: 'IP' }),
        validator(v, id) {
          // 与其他输入框的值不能重复
          if (!v) return true;
          const row = this.table.data.find(item => item.id === id);
          if (!row) return;
          return this.handleValidateUnique(row, { prop: 'login_ip' });
        },
      },
    ],
  },
  // {
  //   label: 'BT节点探测',
  //   prop: 'peer_exchange_switch_for_agent',
  //   tips: 'BT节点探测提示',
  //   type: 'switcher',
  //   default: getDefaultConfig(defaultOsType, 'peer_exchange_switch_for_agent', false),
  //   batch: true,
  //   required: false,
  //   noRequiredMark: false,
  //   parentProp: 'trans_info',
  //   width: 90,
  //   manualProp: true,
  // },
  {
    label: '传输限速Unit',
    prop: 'bt_speed_limit',
    type: 'text',
    batch: true,
    required: false,
    noRequiredMark: false,
    // appendSlot: 'MB/s',
    // iconOffset: 40,
    width: 90,
    placeholder: window.i18n.t('请输入'),
    rules: [reguFnMinInteger(1)],
    parentProp: 'trans_info',
    manualProp: true,
  },
  {
    label: '数据压缩',
    prop: 'enable_compression',
    type: 'switcher',
    default: getDefaultConfig(defaultOsType, 'enable_compression', false),
    tips: '数据压缩tip',
    batch: true,
    required: false,
    noRequiredMark: false,
    width: 90,
    parentProp: 'trans_info',
    manualProp: true,
  },
  {
    label: '',
    prop: '',
    type: 'operate',
    width: 42,
    manualProp: true,
  },
];

export const tableConfig = $DHCP
  ? config
  : config.filter(item => !DHCP_FILTER_KEYS.includes(item.prop));

export const diffConfigs = {};
