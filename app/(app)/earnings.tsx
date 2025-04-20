import { View, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { Text, Card, SegmentedButtons, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: string;
  customer: string;
  serviceType: string;
};

type EarningsSummary = {
  total: number;
  trips: number;
  hours: number;
  avgPerTrip: number;
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-20T14:30:00Z',
    amount: 85.00,
    type: 'Service Fee',
    customer: 'John Doe',
    serviceType: 'towing',
  },
  {
    id: '2',
    date: '2024-01-20T12:15:00Z',
    amount: 45.00,
    type: 'Service Fee',
    customer: 'Jane Smith',
    serviceType: 'gas',
  },
  {
    id: '3',
    date: '2024-01-19T16:45:00Z',
    amount: 120.00,
    type: 'Service Fee',
    customer: 'Mike Johnson',
    serviceType: 'mechanic',
  },
];

const mockChartData = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [85, 120, 95, 150, 110, 180, 130],
  },
  weekly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [650, 780, 820, 910],
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [2800, 3200, 2900, 3500, 3800, 3600],
  },
};

const BarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const maxValue = Math.max(...data);
  const theme = useTheme();

  return (
    <View style={barStyles.container}>
      <View style={barStyles.barsContainer}>
        {data.map((value, index) => (
          <View key={index} style={barStyles.barWrapper}>
            <View
              style={[
                barStyles.bar,
                {
                  height: `${(value / maxValue) * 100}%`,
                  backgroundColor: theme.colors.primary,
                }
              ]}
            />
            <Text style={barStyles.label}>{labels[index]}</Text>
          </View>
        ))}
      </View>
      <View style={barStyles.yAxis}>
        <Text style={barStyles.yAxisLabel}>${maxValue}</Text>
        <Text style={barStyles.yAxisLabel}>${maxValue / 2}</Text>
        <Text style={barStyles.yAxisLabel}>$0</Text>
      </View>
    </View>
  );
};

export default function EarningsScreen() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('daily');
  const screenWidth = Dimensions.get('window').width;

  const getEarningsSummary = (range: string): EarningsSummary => {
    // Mock data - in real app, calculate based on actual transactions
    switch (range) {
      case 'daily':
        return {
          total: 450.00,
          trips: 6,
          hours: 8,
          avgPerTrip: 75.00,
        };
      case 'weekly':
        return {
          total: 3160.00,
          trips: 42,
          hours: 45,
          avgPerTrip: 75.24,
        };
      case 'monthly':
        return {
          total: 12800.00,
          trips: 168,
          hours: 160,
          avgPerTrip: 76.19,
        };
      default:
        return {
          total: 0,
          trips: 0,
          hours: 0,
          avgPerTrip: 0,
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const summary = getEarningsSummary(timeRange);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.totalEarnings}>
            {formatCurrency(summary.total)}
          </Text>
          <Text variant="bodyMedium" style={styles.earningsLabel}>
            Total Earnings
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="car"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge">{summary.trips}</Text>
              <Text variant="bodySmall">Trips</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge">{summary.hours}h</Text>
              <Text variant="bodySmall">Hours</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleLarge">{formatCurrency(summary.avgPerTrip)}</Text>
              <Text variant="bodySmall">Avg/Trip</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>Earnings Trend</Text>
          <BarChart
            data={mockChartData[timeRange as keyof typeof mockChartData].data}
            labels={mockChartData[timeRange as keyof typeof mockChartData].labels}
          />
        </Card.Content>
      </Card>

      <View style={styles.transactionsHeader}>
        <Text variant="titleLarge">Recent Transactions</Text>
      </View>

      {mockTransactions.map(transaction => (
        <Card key={transaction.id} style={styles.transactionCard}>
          <Card.Content>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionInfo}>
                <MaterialCommunityIcons
                  name={transaction.serviceType === 'towing' ? 'tow-truck' :
                    transaction.serviceType === 'gas' ? 'gas-station' : 'wrench'}
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.transactionDetails}>
                  <Text variant="titleMedium">{transaction.type}</Text>
                  <Text variant="bodySmall" style={styles.transactionCustomer}>
                    {transaction.customer}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionAmount}>
                <Text variant="titleMedium" style={styles.amount}>
                  {formatCurrency(transaction.amount)}
                </Text>
                <Text variant="bodySmall" style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  totalEarnings: {
    textAlign: 'center',
    color: '#2563EB',
    fontWeight: 'bold',
  },
  earningsLabel: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
  },
  chartTitle: {
    marginBottom: 16,
  },
  transactionsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  transactionCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionCustomer: {
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#2563EB',
  },
  transactionDate: {
    color: '#6B7280',
  },
});

const barStyles = StyleSheet.create({
  container: {
    height: 220,
    flexDirection: 'row',
    paddingVertical: 20,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 20,
    minHeight: 5,
    borderRadius: 4,
  },
  label: {
    marginTop: 8,
    fontSize: 10,
    color: '#6B7280',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
}); 