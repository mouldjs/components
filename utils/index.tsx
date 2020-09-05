import { Path } from '@mouldjs/core/types'

export * from '@mouldjs/core/utils'

export const pathToString = (path: Path) =>
    path[0].join('/') + '/' + path[1].join('-')
