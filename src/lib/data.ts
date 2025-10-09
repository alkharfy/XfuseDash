import type { User, Client, Notification } from './types';

const now = new Date();

export const mockUsers: User[] = [
  {
    uid: 'mod1',
    name: 'سالم المدير',
    email: 'moderator@marketflow.com',
    role: 'moderator',
    active: true,
    createdAt: new Date(),
    avatarUrl: 'https://picsum.photos/seed/user1/40/40',
  },
  {
    uid: 'pr1',
    name: 'علي العلاقات',
    email: 'pr@marketflow.com',
    role: 'pr',
    active: true,
    createdAt: new Date(),
    avatarUrl: 'https://picsum.photos/seed/user2/40/40',
  },
  {
    uid: 'res1',
    name: 'فاطمة باحثة',
    email: 'researcher@marketflow.com',
    role: 'market_researcher',
    active: true,
    createdAt: new Date(),
    avatarUrl: 'https://picsum.photos/seed/user3/40/40',
  },
  {
    uid: 'cre1',
    name: 'خالد مبدع',
    email: 'creative@marketflow.com',
    role: 'creative',
    active: true,
    createdAt: new Date(),
    avatarUrl: 'https://picsum.photos/seed/user4/40/40',
  },
  {
    uid: 'con1',
    name: 'نورة كاتبة',
    email: 'content@marketflow.com',
    role: 'content',
    active: true,
    createdAt: new Date(),
    avatarUrl: 'https://picsum.photos/seed/user5/40/40',
  },
];

export const mockClients: Client[] = [
  {
    id: 'client1',
    name: 'شركة الأمل للتجارة',
    phone: '0501234567',
    registeredBy: 'mod1',
    registeredAt: { seconds: now.getTime() / 1000 - 86400 * 2, nanoseconds: 0 },
    basicInfo: {
      email: 'hope@trade.com',
      address: '123 شارع الملك فهد، الرياض',
      notes: 'عميل محتمل كبير في قطاع التجزئة.',
    },
    assignedToPR: 'pr1',
    prStatus: 'in_progress',
    transferStatus: 'approved',
    serviceRequests: { marketResearch: true, content: true, creative: true },
    prAppointments: [
        { date: { seconds: now.getTime() / 1000 + 86400, nanoseconds: 0 }, time: '10:00', status: 'scheduled'},
    ],
    marketResearchFiles: [
      { fileName: 'تحليل السوق.pdf', fileUrl: '#', uploadedAt: { seconds: now.getTime() / 1000 - 86400, nanoseconds: 0 }, uploadedBy: 'res1'},
    ],
    researchStatus: 'completed',
    marketResearchSummary: 'ملخص البحث: يظهر التحليل أن هناك فرصة كبيرة في السوق للمنتجات الصديقة للبيئة. يوصى بالتركيز على حملات التسويق الرقمي التي تستهدف الفئة العمرية 25-40.',
    creativeStatus: 'in_progress',
    contentCalendar: [
        { date: { seconds: now.getTime() / 1000 + 86400 * 5, nanoseconds: 0 }, idea: 'إطلاق حملة إعلانية للمنتجات الجديدة', status: 'scheduled' },
    ],
    contentStatus: 'pending',
    finalAgreement: {
      approved: true,
      agreementDetails: 'عقد تسويق شامل لمدة 6 أشهر.',
      duration: 6,
      startDate: { seconds: now.getTime() / 1000, nanoseconds: 0 },
      approvedBy: 'pr1',
      approvedAt: { seconds: now.getTime() / 1000 - 86400, nanoseconds: 0 },
    }
  },
  {
    id: 'client2',
    name: 'مؤسسة النجاح التقني',
    phone: '0559876543',
    registeredBy: 'mod1',
    registeredAt: { seconds: now.getTime() / 1000, nanoseconds: 0 },
    basicInfo: {
      email: 'success@tech.sa',
      address: '456 طريق الأمير محمد، جدة',
      notes: 'شركة ناشئة في مجال التكنولوجيا المالية.',
    },
    assignedToPR: 'pr1',
    prStatus: 'pending',
    transferStatus: 'active',
    serviceRequests: { marketResearch: true, content: false, creative: false },
    prAppointments: [],
  },
  {
    id: 'client3',
    name: 'مطاعم الذواقة',
    phone: '0533334444',
    registeredBy: 'mod1',
    registeredAt: { seconds: now.getTime() / 1000 - 86400 * 5, nanoseconds: 0 },
    basicInfo: {
      email: 'gourmet@food.com',
      address: '789 شارع التحلية، الدمام',
      notes: 'سلسلة مطاعم فاخرة تبحث عن توسع.',
    },
    assignedToPR: 'pr1',
    prStatus: 'completed',
    transferStatus: 'approved',
    serviceRequests: { marketResearch: true, content: true, creative: true },
    researchStatus: 'completed',
    creativeStatus: 'completed',
    contentStatus: 'in_progress',
    contentTasks: [
        { title: 'كتابة مقال عن قائمة الطعام الجديدة', dueDate: { seconds: now.getTime() / 1000 + 86400 * 7, nanoseconds: 0 }, status: 'in_progress', assignedTo: 'con1' }
    ]
  },
    {
    id: 'client4',
    name: 'المركز الطبي الحديث',
    phone: '0541122334',
    registeredBy: 'mod1',
    registeredAt: { seconds: now.getTime() / 1000 - 86400 * 10, nanoseconds: 0 },
    basicInfo: {
      email: 'modern@medical.com',
      address: '101 شارع الصحة، الرياض',
      notes: 'يحتاجون إلى حملة توعوية.',
    },
    assignedToPR: 'pr1',
    prStatus: 'under_review',
    transferStatus: 'active',
    serviceRequests: { marketResearch: false, content: true, creative: false },
  },
  {
    id: 'client5',
    name: 'المستقبل للعقارات',
    phone: '0567788990',
    registeredBy: 'mod1',
    registeredAt: { seconds: now.getTime() / 1000 - 86400 * 1, nanoseconds: 0 },
    basicInfo: {
      email: 'future@realestate.com',
      address: '212 برج المملكة، الرياض',
      notes: 'مشروع جديد كبير.',
    },
    prStatus: 'pending',
    transferStatus: 'active',
    serviceRequests: { marketResearch: false, content: false, creative: false },
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'pr1',
    type: 'status_change',
    message: "تم تحديث حالة العميل 'شركة الأمل للتجارة' إلى 'قيد التنفيذ'",
    relatedClientId: 'client1',
    read: false,
    createdAt: { seconds: now.getTime() / 1000 - 3600, nanoseconds: 0 },
  },
  {
    id: 'notif2',
    userId: 'cre1',
    type: 'new_client',
    message: "تم تعيين العميل 'مطاعم الذواقة' لك",
    relatedClientId: 'client3',
    read: false,
    createdAt: { seconds: now.getTime() / 1000 - 7200, nanoseconds: 0 },
  },
  {
    id: 'notif3',
    userId: 'mod1',
    type: 'agreement_approved',
    message: "تمت الموافقة على الاتفاقية النهائية للعميل 'شركة الأمل للتجارة'",
    relatedClientId: 'client1',
    read: true,
    createdAt: { seconds: now.getTime() / 1000 - 86400, nanoseconds: 0 },
  },
];
