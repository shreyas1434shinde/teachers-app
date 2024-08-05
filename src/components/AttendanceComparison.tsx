import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import useStore from '../store/store';
import { useTheme } from '@mui/material/styles';
import { overallAttendanceInPercentageStatusList } from '@/services/AttendanceService';
import { cohortPrivileges } from '@/utils/app.constant';

interface Cohort {
  cohortId: string;
  cohortType: string;
  name: string;
}

interface AttendanceResult {
  present_percentage?: string;
  absent_percentage?: string;
  present?: number;
  absent?: number;
}

interface AttendanceResponse {
  statusCode: number;
  message: string;
  data: {
    result: {
      contextId: {
        [key: string]: AttendanceResult;
      };
    };
  };
}

const AttendanceComparison: React.FC = () => {
  const { t } = useTranslation();
  const [centerType, setCenterType] = useState('REGULAR');
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>(
    {}
  );
  const [averageAttendance, setAverageAttendance] = useState(0);
  const store = useStore();
  const theme = useTheme<any>();
  const scope = cohortPrivileges?.STUDENT;

  const handleCenterTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCenterType(event.target.value);
  };

  

  useEffect(() => {
    const cohortIds =
      store?.cohorts?.map((pair: Cohort) => pair?.cohortId) || [];

    const fetchData = async () => {
      const promises = cohortIds?.map((cohortId: string) =>
        overallAttendanceInPercentageStatusList({
          limit: 0,
          page: 0,
          filters: { contextId: cohortId, scope },
          facets: ['contextId'],
        })
      );

      const results: AttendanceResponse[] = await Promise.all(promises);
      const dataMap: Record<string, string> = {};

      results.forEach((result) => {
        if (result.statusCode === 200 && result?.data?.result?.contextId) {
          Object.keys(result?.data?.result?.contextId).forEach((id) => {
            dataMap[id] =
              result?.data?.result?.contextId[id]?.present_percentage || '0';
          });
        }
      });

      setAttendanceData(dataMap);

      const totalAttendance = Object.values(dataMap).reduce(
        (acc, curr) => acc + parseFloat(curr),
        0
      );
      const average =
        cohortIds.length > 0 ? totalAttendance / cohortIds.length : 0;
      setAverageAttendance(average);
    };

    fetchData();
  }, [store?.cohorts, scope]);

  const data =
    store?.cohorts
      ?.filter((pair: Cohort) => pair?.cohortType === centerType)
      .map((pair: Cohort) => ({
        name: pair.name,
        Attendance: Number(attendanceData[pair?.cohortId]) || 0,
      })) || [];

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const offsetX = width < 40 ? width + 5 : width / 2; // Adjust position based on bar width
    return (
      <text
        x={x + offsetX}
        y={y + height / 2}
        fill="black"
        textAnchor={width < 40 ? 'start' : 'middle'} // Adjust anchor based on bar width
        dominantBaseline="middle"
        fontSize={15}
        fontWeight="bold" // Make the font bold
      >
        {value}%
      </text>
    );
  };

  return (
    <Box
      sx={{
        padding: 1,
        borderRadius: 5,
        border: '1px solid #D0C5B4',
        marginTop: '20px',
      }}
    >
      <Typography variant="h2" fontSize={'16px'} sx={{ color: 'black' }}>
        {t('DASHBOARD.ATTENDANCE_COMPARISON')}
      </Typography>
      <FormControl component="fieldset">
        <Typography fontSize={'12px'} mt={2}>
          {t('DASHBOARD.CENTER_TYPE')}
        </Typography>
        <RadioGroup
          row
          aria-label="center type"
          name="centerType"
          value={centerType}
          onChange={handleCenterTypeChange}
        >
          <FormControlLabel
          color='black'
            value="REGULAR"
            control={<Radio  sx={{
              '&.Mui-checked': {
                color: 'black',
              },
            }} />}
            label="Regular"
          />
          <FormControlLabel value="REMOTE" control={<Radio  sx={{
          '&.Mui-checked': {
            color: 'black',
          },
        }} />} label="Remote" />
        </RadioGroup>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Typography align="left" sx={{ marginBottom: '16px' }}>  
          {t('DASHBOARD.BLOCK_AVERAGE_ATTENDANCE')}:{' '}
          {averageAttendance.toFixed(2)}%
        </Typography>

        <Box sx={{ height: '400px', overflowY: 'scroll' }}>
          <ResponsiveContainer width="100%" height={data.length * 80}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                stroke={theme.palette.warning.A700}
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(value: any) => `${value}%`}
                display="none"
              />
              <YAxis type="category" dataKey="name" /> 
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Bar dataKey="Attendance" fill="#DAA200" barSize={40} radius={2}>
                <LabelList dataKey="Attendance" content={renderCustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <ResponsiveContainer width="100%" height={40}>
          <BarChart
            layout="vertical"
            data={[{ name: '', Attendance: 0 }]}
            margin={{ top: 5, right: 5, left: 69, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={(value: any) => `${value}%`}
              domain={[0, 100]} 
            />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <LabelList dataKey="Attendance" content={renderCustomLabel} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default AttendanceComparison;
