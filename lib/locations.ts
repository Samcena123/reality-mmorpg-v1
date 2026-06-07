import { GameLocation } from "./types";

export const locations: GameLocation[] = [
  {
    id: "loc-001",
    name: "台南城門廣場",
    position: { lat: 23.1235, lng: 120.2546 },
    radius: 150,
    type: "exploration",
    description: "城市偵查據點，日常移動會轉化為公會情報。",
    rewardExp: 45,
  },
  {
    id: "loc-002",
    name: "夜市補給商",
    position: { lat: 23.1215, lng: 120.2368 },
    radius: 120,
    type: "food",
    description: "體力任務、料理委託與商人聲望的補給中心。",
    rewardExp: 55,
  },
  {
    id: "loc-003",
    name: "公會大廳中庭",
    position: { lat: 23.1272, lng: 120.2974 },
    radius: 180,
    type: "social",
    description: "與盟友會合、完成隊伍報到，並推進今日世界狀態。",
    rewardExp: 60,
  },
  {
    id: "loc-004",
    name: "裂隙瞭望塔",
    position: { lat: 23.1186, lng: 120.2634 },
    radius: 160,
    type: "boss",
    description: "高威脅區域，若長時間忽視，每日首領會逐漸增強。",
    rewardExp: 100,
  },
  {
    id: "loc-005",
    name: "隱藏遺物藏匿點",
    position: { lat: 23.1311, lng: 120.2489 },
    radius: 90,
    type: "rare",
    description: "輪替出現的稀有節點，擁有較高掉寶率與短時間驗證窗口。",
    rewardExp: 85,
  },
];
