import { Fragment, ReactNode, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Modal,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import {
  Chart,
  ChartData,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BACKEND_URL } from '../common';

const GENERIC_WAIT_MESSAGE = 'Waiting for explanation...';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
);

type DataRow = Record<string, string | number>;

interface ScatterData {
  datasets: {
    label: string;
    data: { x: number; y: number }[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const NUM_DATA_POINTS = 35;

const prepareBarChartData = (data: DataRow[], column1: string, column2: string) => {
  const randomData = shuffleArray([...data]).slice(0, NUM_DATA_POINTS);
  const labels = randomData.map((row) => row[column1].toString());
  const values = randomData.map((row) => Number(row[column2]));

  return {
    labels,
    datasets: [
      {
        label: `${column2} by ${column1}`,
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
};

const prepareLineChartData = (data: DataRow[], column: string) => {
  const randomData = shuffleArray([...data]).slice(0, NUM_DATA_POINTS);
  return {
    labels: randomData.map((row) => row[column].toString()),
    datasets: [
      {
        label: column,
        data: randomData.map((row) => Number(row[column])),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
};

const preparePointChartData = (data: DataRow[], column1: string, column2: string) => {
  const randomData = shuffleArray([...data]).slice(0, NUM_DATA_POINTS);

  return {
    datasets: [
      {
        label: `${column1} vs ${column2}`,
        data: randomData.map((row) => ({
          x: Number(row[column1]),
          y: Number(row[column2]),
        })),
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };
};

type DataOutputProps = {
  data: any[] | null;
  columnSuggestions: string | null;
  isLoading: boolean;
};

const DataOutput: React.FC<DataOutputProps> = ({ data, columnSuggestions, isLoading }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openSmallModal, setOpenSmallModal] = useState(false);
  const [graphExplanation, setGraphExplanation] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsMessages, setWsMessages] = useState<string[]>([]);

  const initialBarChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const [barChartData, setBarChartData] =
    useState<ChartData<'bar', number[], string>>(initialBarChartData);

  const initialLineChartData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

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
    if (openModal) {
      const newWs = new WebSocket(`ws://${BACKEND_URL}/ws`);
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
      setWs(newWs);
    } else {
      ws?.close();
    }
    return () => {
      ws?.close();
    };
  }, [openModal, data]);

  if (isLoading) {
    return (
      <Container style={{ marginTop: 20 }}>
        <Skeleton variant='rectangular' width='100%' height={400} style={{ borderRadius: '8px' }} />
        <Container style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Skeleton
            variant='rectangular'
            width={200}
            height={40}
            style={{ borderRadius: '8px' }}
            animation='wave'
          />
        </Container>
        <Container
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 20,
            flexWrap: 'wrap',
          }}
        >
          <Skeleton
            variant='rectangular'
            width='30%'
            height={300}
            style={{ borderRadius: '8px' }}
            animation='wave'
          />
          <Skeleton
            variant='rectangular'
            width='30%'
            height={300}
            style={{ borderRadius: '8px' }}
          />
          <Skeleton
            variant='rectangular'
            width='30%'
            height={300}
            style={{ borderRadius: '8px' }}
            animation='wave'
          />
        </Container>
      </Container>
    );
  } else if (!data || data.length === 0) {
    return <Container>There's no data to display 😔</Container>;
  }

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleExplainGraph = (graphType: string) => {
    setGraphExplanation(
      `GPT explanation here. This is a ${graphType} graph. \
      It shows ${graphType.toLowerCase()}s of the data.`,
    );
    setOpenSmallModal(true);
  };

  const handleCloseExplainGraph = () => setOpenSmallModal(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const renderTableRows = (data: any[]) => {
    return data.slice(0, 100).map((row, rowIndex) => (
      <TableRow key={`row-${rowIndex}`}>
        {Object.entries(row).map(([key, value], cellIndex) => (
          <TableCell key={`${key}-${cellIndex}`}>{value as ReactNode}</TableCell>
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
          color='primary'
          startIcon={<AutoAwesomeIcon />}
          onClick={handleOpenModal}
        >
          Explain this data
        </Button>
      </Container>

      <Container
        style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20, flexWrap: 'wrap' }}
      >
        {/* Bar Graph Card */}
        <Card style={{ flex: 1, margin: '10px', maxWidth: '30%' }}>
          <CardContent style={{ height: '300px' }}>
            <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
          </CardContent>
          <Box display='flex' justifyContent='center' marginBottom='10px'>
            <Button
              size='small'
              color='primary'
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleExplainGraph('Bar')}
            >
              Explain
            </Button>
          </Box>
        </Card>

        {/* Line Graph Card */}
        <Card style={{ flex: 1, margin: '10px', maxWidth: '30%' }}>
          <CardContent style={{ height: '300px' }}>
            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
          </CardContent>
          <Box display='flex' justifyContent='center' marginBottom='10px'>
            <Button
              size='small'
              color='primary'
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleExplainGraph('Line')}
            >
              Explain
            </Button>
          </Box>
        </Card>

        {/* Point Graph Card */}
        <Card style={{ flex: 1, margin: '10px', maxWidth: '30%' }}>
          <CardContent style={{ height: '300px' }}>
            <Scatter data={pointChartData} options={{ maintainAspectRatio: false }} />
          </CardContent>
          <Box display='flex' justifyContent='center' marginBottom='10px'>
            <Button
              size='small'
              color='primary'
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleExplainGraph('Point')}
            >
              Explain
            </Button>
          </Box>
        </Card>
      </Container>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby='modal-title'
        aria-describedby='modal-description'
      >
        <Box
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            backgroundColor: 'white',
            padding: '20px 30px',
            borderRadius: 6,
          }}
        >
          <Typography>
            {wsMessages
              .join('')
              .split('\n')
              .map((line, index) => (
                <Fragment key={index}>
                  {line}
                  <br />
                </Fragment>
              ))}
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Button onClick={handleCloseModal} color='primary'>
              OK
            </Button>
          </div>
        </Box>
      </Modal>

      <Modal open={openSmallModal} onClose={handleCloseExplainGraph}>
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '4px',
          }}
        >
          <Typography>{graphExplanation}</Typography>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <Button onClick={handleCloseExplainGraph} color='primary'>
              OK
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default DataOutput;
