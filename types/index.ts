interface IMysteryPage {
  mystery: string[]
  total: number
  nextOffset: number
}

interface IMysteryQuery {
  offset: number,
  limit: number
}

export {
  type IMysteryPage,
  type IMysteryQuery
}