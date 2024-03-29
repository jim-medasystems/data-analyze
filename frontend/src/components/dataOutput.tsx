import { Fragment, ReactNode, useEffect, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { ChartData } from 'chart.js';
import { CustomSkeleton } from '../common';
import {
  GraphCard,
  initialBarChartData,
  initialLineChartData,
  prepareBarChartData,
  prepareLineChartData,
  preparePointChartData,
  ScatterData,
} from './graph';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';

const GENERIC_WAIT_MESSAGE = 'Waiting for explanation...';

type DataOutputProps = {
  data: any[] | null;
  columnSuggestions: string | null;
  isLoading: boolean;
};

const DataOutput: React.FC<DataOutputProps> = ({ data, columnSuggestions, isLoading }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [wsFlag, setWsFlag] = useState(false);
  const [dataBuffer, setDataBuffer] = useState<string | null>(null);

  const dataHash = md5(JSON.stringify(data));

  if (data && data.length > 0 && dataHash !== dataBuffer) {
    setDataBuffer(dataHash);
    setWsFlag(false);
  }

  const [barChartData, setBarChartData] =
    useState<ChartData<'bar', number[], string>>(initialBarChartData);
  const [lineChartData, setLineChartData] =
    useState<ChartData<'line', number[], string>>(initialLineChartData);
  const [pointChartData, setPointChartData] = useState<ScatterData>({ datasets: [] });

  useEffect(() => {
    if (data && data.length > 0 && columnSuggestions) {
      try {
        const suggestions = JSON.parse(columnSuggestions);

        if (suggestions.bar && suggestions.bar.length === 2) {
          setBarChartData(prepareBarChartData(data, suggestions.bar[0], suggestions.bar[1]));
        }

        if (suggestions.line) {
          setLineChartData(prepareLineChartData(data, suggestions.line));
        }

        if (suggestions.scatter && suggestions.scatter.length === 2) {
          setPointChartData(
            preparePointChartData(data, suggestions.scatter[0], suggestions.scatter[1]),
          );
        }
      } catch (error) {
        console.error('Error parsing column suggestions:', error);
      }
    }
  }, [data, columnSuggestions]);

  useEffect(() => {
    setWsMessages([GENERIC_WAIT_MESSAGE]);
  }, [data]);

  useEffect(() => {
    if (drawerOpen) {
      if (wsFlag) {
        return;
      } else {
        const newWs = new WebSocket(`${import.meta.env.VITE_BACKEND_URL_WS}`);
        newWs.onopen = () => {
          if (data) {
            newWs.send(JSON.stringify(data));
          }
        };
        newWs.onmessage = (event) => {
          setWsMessages((prevMessages) => {
            // Check if the default message is still there
            if (prevMessages.length === 1 && prevMessages[0] === GENERIC_WAIT_MESSAGE) {
              return [event.data];
            } else {
              return [...prevMessages, event.data];
            }
          });
        };
        newWs.onclose = () => {
          setWsFlag(true);
        };
        setWs(newWs);
      }
    } else {
      ws?.close();
    }
    return () => {
      ws?.close();
    };
  }, [drawerOpen, data, wsFlag]);

  if (isLoading) {
    return (
      <Container style={{ marginTop: 20 }}>
        <CustomSkeleton width='100%' height={400} />
        <Container style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <CustomSkeleton width='200px' height={40} />
        </Container>
        <Container
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 20,
            flexWrap: 'wrap',
          }}
        >
          {Array.from({ length: 3 }).map(() => (
            <CustomSkeleton key={uuidv4()} width='30%' height={300} />
          ))}
        </Container>
      </Container>
    );
  } else if (!data || data.length === 0) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <Typography variant='h6'>There's no data to display 😔</Typography>
      </Container>
    );
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const renderTableRows = (data: any[]) => {
    return data.slice(0, 100).map((row) => (
      <TableRow key={uuidv4()}>
        {Object.entries(row).map(([_, value]) => (
          <TableCell key={uuidv4()}>{value as ReactNode}</TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <>
      <Container
        style={{ display: 'flex', justifyContent: 'center', marginTop: 20, userSelect: 'none' }}
      >
        <TableContainer component={Paper} style={{ maxHeight: 400 }}>
          <Table stickyHeader aria-label='table'>
            <TableHead>
              <TableRow>
                {Object.keys(data[0]).map((key) => (
                  <TableCell
                    key={`${key}`}
                    style={{ fontWeight: 'bold', backgroundColor: 'rgb(227,252,255)' }}
                  >
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderTableRows(data)}</TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <Button
          variant='contained'
          color='warning'
          startIcon={<AutoAwesomeIcon />}
          onClick={handleOpenDrawer}
        >
          Explain this data
        </Button>
      </Container>

      <Container
        style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, flexWrap: 'wrap' }}
      >
        <GraphCard graphType='Bar' graphData={barChartData} />
        <GraphCard graphType='Line' graphData={lineChartData} />
        <GraphCard graphType='Scatter' graphData={pointChartData} />
      </Container>

      <Drawer anchor='top' open={drawerOpen} onClose={handleCloseDrawer}>
        <Box
          style={{
            width: '100%',
            padding: '20px 30px',
          }}
        >
          <Typography>
            {wsMessages
              .join('')
              .split('\n')
              .map((line) => (
                <Fragment key={uuidv4()}>
                  {line}
                  <br />
                </Fragment>
              ))}
          </Typography>
          <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Button onClick={handleCloseDrawer} color='primary'>
              OK
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default DataOutput;
