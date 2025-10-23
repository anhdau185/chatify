const CONTACTS = [
  {
    id: 1,
    name: 'Sarah Chen',
    status: 'online',
    lastMsg: 'See you tomorrow!',
    time: '2m',
    unread: 0,
    active: false,
  },
  {
    id: 2,
    name: 'Alex Rivera',
    status: 'online',
    lastMsg: "That's great advice, thanks!",
    time: '5m',
    unread: 0,
    active: true,
  },
  {
    id: 3,
    name: 'Team Design',
    status: 'offline',
    lastMsg: 'Meeting at 3pm',
    time: '1h',
    unread: 3,
    active: false,
  },
  {
    id: 4,
    name: 'Jordan Lee',
    status: 'online',
    lastMsg: 'Thanks for the help!',
    time: '3h',
    unread: 0,
    active: false,
  },
  {
    id: 5,
    name: 'Maya Patel',
    status: 'offline',
    lastMsg: 'Sent you the files',
    time: '1d',
    unread: 1,
    active: false,
  },
];

const MESSAGES = [
  {
    id: 1,
    text: "Hey! How's it going?",
    sender: 'other',
    time: '10:30 AM',
  },
  {
    id: 2,
    text: 'Pretty good! Just working on some new designs. What about you?',
    sender: 'me',
    time: '10:32 AM',
  },
  {
    id: 3,
    text: "Nice! I'd love to see them when you're ready to share.",
    sender: 'other',
    time: '10:33 AM',
  },
  {
    id: 4,
    text: "Actually, I'm trying to create something minimal and modern. Any suggestions?",
    sender: 'other',
    time: '10:34 AM',
  },
  {
    id: 5,
    text: 'Absolutely! Focus on white space, subtle gradients, and smooth transitions. Less is more!',
    sender: 'me',
    time: '10:36 AM',
  },
  {
    id: 6,
    text: "That's great advice, thanks! 🙌",
    sender: 'other',
    time: '10:37 AM',
  },
];

const ROOM_ID = '8897c46b-7fd8-45a4-a12b-8dabf64e4427';

const MOCK_USER_1 = {
  id: 1,
  name: 'Alex Rivera',
  email: null,
  username: 'chatify1',
};

const MOCK_USER_2 = {
  id: 2,
  name: 'Jordan Lee',
  email: null,
  username: 'chatify2',
};

const MOCK_USER_3 = {
  id: 3,
  name: 'Morgan Smith',
  email: null,
  username: 'chatify3',
};

const MOCK_CHAT_ROOM_1 = {
  id: '8897c46b-7fd8-45a4-a12b-8dabf64e4427',
  members: [MOCK_USER_1, MOCK_USER_2], // MOCK_USER_1 and MOCK_USER_2
  isGroup: false, // 1:1 DM conversation
};

const MOCK_CHAT_ROOM_2 = {
  id: '40194dfa-5e2f-450e-af6e-07404d48da98',
  members: [MOCK_USER_1, MOCK_USER_3], // MOCK_USER_1 and MOCK_USER_3
  isGroup: false, // 1:1 DM conversation
};

const MOCK_CHAT_ROOM_3 = {
  id: 'f64b6e1a-338c-46dd-90aa-ceaedf780fad',
  members: [MOCK_USER_2, MOCK_USER_3], // MOCK_USER_2 and MOCK_USER_3
  isGroup: false, // 1:1 DM conversation
};

const MOCK_GROUP_CHAT_ROOM = {
  id: '5d64a654-8dde-47f2-84da-17733ea0c6ad',
  name: 'Study Group',
  members: [MOCK_USER_1, MOCK_USER_2, MOCK_USER_3],
  isGroup: true, // Group chat
};

const ALL_MOCK_CHAT_ROOMS = [
  MOCK_CHAT_ROOM_1,
  MOCK_CHAT_ROOM_2,
  MOCK_CHAT_ROOM_3,
  MOCK_GROUP_CHAT_ROOM,
];

export { CONTACTS, MESSAGES, ROOM_ID, ALL_MOCK_CHAT_ROOMS };
