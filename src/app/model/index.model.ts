export type Tag = 'ad'

export interface IndexWorld {
  name: string
  game: string
  version: string
  hidden: boolean
  sane_version?: string // this is always semver
  display_name?: string
  tags: Tag[]
  wiki?: string
  discord?: string
}
