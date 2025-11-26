export type BuildingData = {
  id: string;
  name: string;
  description: string;
  hp?: number;
  armor?: number;
  craftableItems?: string[];
  iconPath?: string;
};

export const BUILDINGS: BuildingData[] = [
];

export function getBuildingById(id: string): BuildingData | undefined {
  return BUILDINGS.find(b => b.id === id);
}

export function getBuildingsByCraftableItem(itemId: string): BuildingData[] {
  return BUILDINGS.filter(b => 
    b.craftableItems?.some(item => item.toLowerCase() === itemId.toLowerCase())
  );
}
