interface ImysteryData {
  mystery: string
  min: string
  totalBalance: string
  desc: string
  triedCount: string
  manager: string
  winner: string
  winAmount: string
}
interface IMysteryPage {
  mystery: ImysteryData[]
  total: number
  nextOffset: number
}

interface IMysteryQuery {
  offset: number,
  limit: number
}

export {
  type ImysteryData,
  type IMysteryPage,
  type IMysteryQuery,
}