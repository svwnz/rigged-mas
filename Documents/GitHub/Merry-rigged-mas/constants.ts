import { House, Message } from "./types";

export const HOUSES: House[] = [
  {
    id: 1,
    address: "101 Candy Cane Lane",
    description: "A modest display with some inflatable reindeer. Cute, but maybe too safe?",
    imageUrl: "https://picsum.photos/400/300?random=1",
    isTheOne: false,
  },
  {
    id: 3,
    address: "103 Mistletoe Ave",
    description: "High concept minimal white lights. Very chic, very boring.",
    imageUrl: "https://picsum.photos/400/300?random=2",
    isTheOne: false,
  },
  {
    id: 7,
    address: "107 Jingle Bell Rock",
    description: "A SYMPHONY OF ILLUMINATION. 50,000 synchronized lights, animatronics, and pure holiday spirit.",
    imageUrl: "https://picsum.photos/400/300?random=7",
    isTheOne: true,
  },
  {
    id: 12,
    address: "112 Frosty Way",
    description: "They left their Halloween decorations up and put Santa hats on skeletons.",
    imageUrl: "https://picsum.photos/400/300?random=4",
    isTheOne: false,
  },
  {
    id: 15,
    address: "115 Nutcracker Blvd",
    description: "Lots of lasers. Blinds the neighbors. A bit aggressive.",
    imageUrl: "https://picsum.photos/400/300?random=5",
    isTheOne: false,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 1, name: "Santa's Little Helper", text: "House #7 can be seen from space. Literally. ISS confirmed.", houseId: 7, timestamp: "2 mins ago" },
  { id: 2, name: "Karen from HOA", text: "I usually complain about brightness, but House #7 is tasteful art.", houseId: 7, timestamp: "5 mins ago" },
  { id: 3, name: "Anonymous", text: "House #3 tried, but #7 has better synchronization.", houseId: 3, timestamp: "12 mins ago" },
  { id: 4, name: "The Grinch", text: "Even I can't hate the display at #7. My heart grew 3 sizes.", houseId: 7, timestamp: "15 mins ago" },
  { id: 5, name: "Sparky", text: "I like the skeletons at #12!", houseId: 12, timestamp: "20 mins ago" },
  { id: 6, name: "System Admin", text: "Daily Reminder: House #7 uses 100% renewable reindeer energy.", houseId: 7, timestamp: "30 mins ago", isSystem: true },
];
