import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

const GraphComponents = {
  Bar: Bar,
  Line: Line,
  Scatter: Scatter,
};

export const GraphCard = ({ graphType, graphData }: { graphType: string; graphData: any }) => {
  const GraphComponent = GraphComponents[graphType as keyof typeof GraphComponents];
  const theme = useTheme();
  const warning = theme.palette.warning.main;

  return (
    <Card style={{ flex: 1, margin: '10px', maxWidth: '30%' }}>
      <CardContent style={{ height: '300px' }}>
        <GraphComponent data={graphData} options={{ maintainAspectRatio: false }} />
      </CardContent>
      <Box display='flex' justifyContent='center' marginBottom='10px' px={2} paddingBottom={1}>
        <Typography style={{ fontSize: '14px' }} component='div'>
          <Box
            display='flex'
            alignItems='top'
            style={{ background: '#fff6e3', borderRadius: '15px', padding: '15px' }}
          >
            <AutoAwesomeIcon style={{ marginRight: '8px', color: warning }} />
            <Box>
              This is a {graphType} graph.
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur et eros vitae nisi
              viverra viverra sit amet non nisl.
              <br />
              <br />
              Vivamus tincidunt gravida tortor ut ornare. Pellentesque gravida risus semper massa
              congue ullamcorper.
            </Box>
          </Box>
        </Typography>
      </Box>
    </Card>
  );
};

export interface ScatterData {
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

export const prepareBarChartData = (data: DataRow[], column1: string, column2: string) => {
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

export const prepareLineChartData = (data: DataRow[], column: string) => {
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

export const preparePointChartData = (data: DataRow[], column1: string, column2: string) => {
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

export const initialBarChartData: ChartData<'bar', number[], string> = {
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

export const initialLineChartData: ChartData<'line', number[], string> = {
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
