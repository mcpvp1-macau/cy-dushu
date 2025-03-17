import JessibucaPro from './jessibuca-pro/jessibuca-pro'

export declare global {
  interface Window {
    JessibucaPro: typeof JessibucaPro
    cyberplayer: any
    AutelMedia: any
    queryTerrain: (lng: number, lat: number) => Promise<number>
  }
}
