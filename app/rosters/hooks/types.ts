export interface RosterMember {
  name: string;
  tag: string;
  userId: string | null;
  username: string | null;
  warPreference: 'in' | 'out' | null;
  role: string | null;
  townHallLevel: number;
  heroes: Record<string, number>;
  trophies: number;
  roster?: {
    tag: string;
    name: string;
    alias?: string | null;
  } | null;
  categoryId?: string | null;
  createdAt: Date;
}

export interface RostersEntity {
  _id: string;
  name: string;
  guildId: string;
  maxMembers?: number;
  minTownHall?: number;
  maxTownHall?: number;
  minHeroLevels?: number;
  roleId?: string | null;
  colorCode?: number;
  clan?: {
    tag: string;
    name: string;
    badgeUrl: string;
  };
  members: RosterMember[];
  layout?: string;
  sheetId?: string;
  closed: boolean;
  startTime?: Date | null;
  endTime?: Date | null;
  sortBy?: string;
  useClanAlias?: boolean;
  allowUnlinked?: boolean;
  allowMultiSignup?: boolean;
  category: 'GENERAL' | 'CWL' | 'WAR' | 'TROPHY';
  allowCategorySelection?: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface RostersEntityExtended extends RostersEntity {
  membersMap: Record<string, RosterMember[]>;
  membersGrouped: { members: RosterMember[]; categoryId: string }[];
}

export interface RosterCategoriesEntity {
  _id: string;
  displayName: string;
  createdAt: string;
}

export interface GuildRosterOutput {
  rosters: RostersEntity[];
  categories: RosterCategoriesEntity[];
}
