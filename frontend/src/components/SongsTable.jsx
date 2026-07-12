import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Tooltip,
  Rating,
  Skeleton,
  Alert,
  AlertTitle,
  Button,
  Box,
} from '@mui/material'
import { buildCsv, downloadCsv } from '../utils/csv.js'

function SortTriangleIcon(props) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" {...props}>
      <polygon points="5,0 10,10 0,10" fill="currentColor" />
    </svg>
  )
}

const RATING_COLUMN_WIDTH = 140

const TITLE_COLUMN_WIDTH = 180
const CHAR_WIDTH = 9.8
const CELL_PADDING = 3

function headerWidth(label) {
  return Math.ceil(label.length * CHAR_WIDTH) + CELL_PADDING * 2
}

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'danceability', label: 'Danceability', numeric: true },
  { key: 'energy', label: 'Energy', numeric: true },
  { key: 'key', label: 'Key', numeric: true },
  { key: 'loudness', label: 'Loudness', numeric: true },
  { key: 'mode', label: 'Mode', numeric: true },
  { key: 'acousticness', label: 'Acousticness', numeric: true },
  { key: 'instrumentalness', label: 'Instrumentalness', numeric: true },
  { key: 'liveness', label: 'Liveness', numeric: true },
  { key: 'valence', label: 'Valence', numeric: true },
  { key: 'tempo', label: 'Tempo', numeric: true },
  { key: 'duration_ms', label: 'Duration (ms)', numeric: true },
  { key: 'time_signature', label: 'Time Signature', numeric: true },
  { key: 'num_bars', label: 'Num Bars', numeric: true },
  { key: 'num_sections', label: 'Num Sections', numeric: true },
  { key: 'num_segments', label: 'Num Segments', numeric: true },
  { key: 'class', label: 'Class', numeric: true },
  { key: 'rating', label: 'Rating', numeric: true },
].map((col) => ({
  ...col,
  width:
    col.key === 'title'
      ? TITLE_COLUMN_WIDTH
      : col.key === 'rating'
        ? RATING_COLUMN_WIDTH
        : col.key === 'tempo'
          ? headerWidth(col.label) + 24
          : headerWidth(col.label),
}))

export const TABLE_WIDTH = COLUMNS.reduce((sum, col) => sum + col.width, 0)

const PAGE_SIZE = 10
const ROW_HEIGHT = 41
const HEADER_HEIGHT = 68
const PAGINATION_HEIGHT = 52

export function SongsTable({
  store,
  total,
  page,
  setPage,
  sort,
  order,
  setSort,
  updateRating,
  loading,
  error,
  retry,
  searchResult,
}) {
  const visibleCount =
    total === null ? PAGE_SIZE : Math.max(0, Math.min(PAGE_SIZE, total - page * PAGE_SIZE))
  const rows = Array.from({ length: PAGE_SIZE }, (_, slot) => {
    if (slot >= visibleCount) return { slot, index: null, song: null }
    const index = page * PAGE_SIZE + slot
    return { slot, index, song: store.get(index) }
  })

  const findStoreIndex = (songId) => {
    for (const [idx, song] of store.entries()) {
      if (song.id === songId) return idx
    }
    return -1
  }

  const handleSort = (column) => {
    if (searchResult) return
    const direction = sort === column && order === 'asc' ? 'desc' : 'asc'
    setSort(column, direction)
  }

  const renderSongRow = (song, index) => (
    <TableRow key={song.id} hover>
      {COLUMNS.map((col) =>
        col.key === 'title' ? (
          <TableCell key={col.key}>
            <Tooltip title={song.title} enterDelay={400}>
              <span>{song.title}</span>
            </Tooltip>
          </TableCell>
        ) : col.key === 'rating' ? (
          <TableCell key={col.key} align="center">
            <Rating
              value={song.rating ?? 0}
              size="small"
              onChange={(_, newValue) => {
                if (newValue) updateRating(index, song.id, newValue)
              }}
              sx={{ '& .MuiRating-icon': { mx: 0 } }}
            />
          </TableCell>
        ) : (
          <TableCell key={col.key} align={col.numeric ? 'center' : 'left'}>
            {song[col.key] ?? ''}
          </TableCell>
        ),
      )}
    </TableRow>
  )

  const handleExportCsv = () => {
    const visibleSongs = rows.map((r) => r.song).filter(Boolean)
    const csv = buildCsv(COLUMNS, visibleSongs)
    downloadCsv(`songs-page-${page + 1}.csv`, csv)
  }

  const bodyHeight = searchResult ? ROW_HEIGHT : ROW_HEIGHT * PAGE_SIZE
  const paperHeight = HEADER_HEIGHT + bodyHeight + (searchResult ? 0 : PAGINATION_HEIGHT)

  return (
    <Paper
      sx={{
        borderRadius: '4px',
        height: paperHeight,
        overflow: 'hidden',
        transition: 'height 250ms ease',
      }}
    >
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          width: TABLE_WIDTH,
          '& th, & td': { px: '3px' },
          '& th:first-of-type, & td:first-of-type': { pl: 2 },
          '& th': {
            height: HEADER_HEIGHT,
            fontSize: '0.95rem',
            fontWeight: 700,
            boxSizing: 'border-box',
            verticalAlign: 'middle',
          },
          '& td': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: ROW_HEIGHT,
            boxSizing: 'border-box',
          },
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.grey[50],
          },
        }}
      >
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                align="center"
                sx={{ whiteSpace: 'nowrap', width: col.width, minWidth: col.width, maxWidth: col.width }}
              >
                <TableSortLabel
                  active={!searchResult && sort === col.key}
                  direction={sort === col.key ? order : 'asc'}
                  onClick={searchResult ? undefined : () => handleSort(col.key)}
                  IconComponent={SortTriangleIcon}
                  hideSortIcon={false}
                  sx={{
                    flexDirection: 'column',
                    gap: 0.25,
                    mt: '6px',
                    cursor: searchResult ? 'default' : 'pointer',
                    pointerEvents: searchResult ? 'none' : 'auto',
                    '& .MuiTableSortLabel-icon': { margin: 0 },
                  }}
                >
                  {col.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          key={`${sort}-${order}-${page}`}
          sx={{
            opacity: 0,
            animation: 'songs-table-fade-in 200ms ease-out forwards',
            '@keyframes songs-table-fade-in': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            display: 'table-row-group',
            minHeight: bodyHeight,
          }}
        >
          {searchResult ? (
            renderSongRow(searchResult, findStoreIndex(searchResult.id))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} sx={{ border: 0, py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Alert
                    severity="error"
                    action={
                      <Button color="inherit" size="small" onClick={retry}>
                        Retry
                      </Button>
                    }
                    sx={{ maxWidth: 480 }}
                  >
                    <AlertTitle>Failed to load songs</AlertTitle>
                    {error.message}
                  </Alert>
                </Box>
              </TableCell>
            </TableRow>
          ) : total === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} align="center" sx={{ border: 0, py: 6 }}>
                No songs found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(({ slot, index, song }) =>
              song ? (
                renderSongRow(song, index)
              ) : (
                <TableRow key={`placeholder-${slot}`}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} align={col.key === 'title' ? 'left' : 'center'}>
                      {loading ? (
                        <Skeleton variant="text" width={col.width * 0.7} sx={{ mx: 'auto' }} />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              ),
            )
          )}
        </TableBody>
      </Table>
      {!searchResult && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <TablePagination
            component="div"
            count={total ?? 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            sx={{
              '& .MuiTablePagination-toolbar': { justifyContent: 'flex-start' },
              '& .MuiTablePagination-spacer': { display: 'none' },
            }}
          />
          <Button size="small" onClick={handleExportCsv}>
            Download CSV
          </Button>
        </Box>
      )}
    </Paper>
  )
}
