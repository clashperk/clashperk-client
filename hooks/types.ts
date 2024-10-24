interface Clan {
  _id: string;
  name: string;
  tag: string;
  order: number;
}

interface Category {
  _id: string;
  name: string;
  order: number;
}

interface Group {
  _id: string;
  name: string;
  order: number;
  clans: Clan[];
}

export interface GuildClansAggregated {
  name: string;
  guildId: string;
  clans: Clan[];
  categories: Category[];
  grouped: Group[];
}
