import { useState } from 'react'
import { Box } from '@mui/material'
import { SongsTable, TABLE_WIDTH } from '../components/SongsTable.jsx'
import { SearchBar } from '../components/SearchBar.jsx'
import { useSongs } from '../hooks/useSongs.js'

const CONTENT_PADDING = 48
const TABLE_BLOCK_HEIGHT = 620
const SEARCH_BAR_TOP = 100

export function SongsPage() {
  const [searchResult, setSearchResult] = useState(null)
  const songs = useSongs()

  return (
    <Box sx={{ minWidth: TABLE_WIDTH + CONTENT_PADDING, position: 'relative', height: TABLE_BLOCK_HEIGHT }}>
      <Box
        sx={{
          position: 'absolute',
          top: SEARCH_BAR_TOP,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 3,
          zIndex: 2,
        }}
      >
        <SearchBar
          store={songs.store}
          isFullyLoaded={songs.isFullyLoaded}
          onResult={setSearchResult}
          onClear={() => setSearchResult(null)}
          hasResult={searchResult !== null}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: SEARCH_BAR_TOP + 60,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 3,
        }}
      >
        <SongsTable {...songs} searchResult={searchResult} />
      </Box>
    </Box>
  )
}
