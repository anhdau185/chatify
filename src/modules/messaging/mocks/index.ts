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

export { CONTACTS, MESSAGES, ROOM_ID };
