export interface Track {
  id?: string | number;
  number: string;
  title: string;
  artist: string;
  edition: string;
  duration: string;
  bg: string;
  accent: string;
  soundcloud_url?: string;
  src?: string;
  notes?: string;
}

export interface Article {
  id?: string | number;
  track_id?: string | number;
  title: string;
  content: string;
  published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdaptedArticle {
  id?: string | number;
  title: string;
  screens: Array<{
    type: 'text' | 'heading' | 'quote' | 'closing';
    content: string;
  }>;
}

export type ViewType = 'coverflow' | 'tracklist' | 'nowplaying';

export interface CoverFlowViewProps {
  tracks: Track[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export interface TrackListViewProps {
  tracks: Track[];
  selectedIndex: number;
  currentIndex: number;
  onSelect?: (index: number) => void;
  onPlay: (index: number) => void;
}

export interface NowPlayingViewProps {
  track: Track;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  onSeek: (progress: number) => void;
  onInfoToggle: () => void;
  soundCloudWidget?: boolean;
  widgetRef?: React.RefObject<HTMLIFrameElement | null>;
  togglePlay?: () => void;
}

export interface NotesViewProps {
  track: Track;
  article?: AdaptedArticle;
  onClose: () => void;
}
