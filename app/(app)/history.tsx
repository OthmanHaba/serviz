import { View, StyleSheet, FlatList, SafeAreaView, Image } from 'react-native';
import { Text, Card, Chip, Searchbar, Menu, Button, IconButton, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { history } from '@/lib/api/service';

type VehicleInfo = {
  make: string;
  model: string;
  year: string;
  color: string;
  vin: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicle_info: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Service = {
  id: number;
  name: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
};

type HistoryItem = {
  id: number;
  user_id: number;
  provider_id: number;
  service_id: number;
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: User;
  provider: User;
  service: Service;
};

const mockHistory: HistoryItem[] = [
  {
    id: 13,
    user_id: 3,
    provider_id: 2,
    service_id: 1,
    price: "100.00",
    status: "Completed",
    created_at: "2025-03-06T04:55:01.000000Z",
    updated_at: "2025-03-07T20:48:45.000000Z",
    user: {
      id: 3,
      name: "user",
      email: "user@user.com",
      phone: "1-570-359-2656",
      vehicle_info: '{"make":"BMW","model":"GT 10","year":"2022","color":"MediumSpringGreen","vin":65464307}',
      role: "user",
      is_active: true,
      created_at: "2025-03-06T02:46:02.000000Z",
      updated_at: "2025-03-06T02:46:02.000000Z"
    },
    provider: {
      id: 2,
      name: "provider",
      email: "user@provider.com",
      phone: "+1-731-896-8647",
      vehicle_info: '{"make":"Suzuki","model":"GT 11","year":"2015","color":"HoneyDew","vin":77934196}',
      role: "provider",
      is_active: true,
      created_at: "2025-03-06T02:46:02.000000Z",
      updated_at: "2025-03-06T02:50:14.000000Z"
    },
    service: {
      id: 1,
      name: "Towing",
      description: "Towing services",
      image: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
      created_at: "2025-03-06T02:46:02.000000Z",
      updated_at: "2025-03-06T02:46:02.000000Z"
    }
  }
];

export default function HistoryScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>('date_desc');
  const [historyItems, setHistoryItems] = useState<HistoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await history();
      setHistoryItems(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const filterHistory = (items: HistoryItem[]) => {
    let filtered = items;
    if(!items) return;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.vehicle_info.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply service type filter
    if (selectedFilter) {
      filtered = filtered.filter(item => item.service.name.toLowerCase() === selectedFilter.toLowerCase());
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'cost_desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'cost_asc':
          return parseFloat(a.price) - parseFloat(b.price);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const vehicleInfo: VehicleInfo = JSON.parse(item.user.vehicle_info);

    return (
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.serviceInfo}>
              
              <Image
                style={{height:24,width:24}}
                resizeMode="contain"
                source={{uri: item.service.image}}
              />
              <Text variant="titleMedium" style={styles.serviceType}>
                {item.service.name}
              </Text>
            </View>
            <Text variant="labelLarge" style={styles.cost}>
              ${parseFloat(item.price).toFixed(2)}
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          <View style={styles.vehicleContainer}>
            <MaterialCommunityIcons name="car" size={16} color="#6B7280" />
            <Text variant="bodySmall" style={styles.location} numberOfLines={1}>
              {vehicleInfo.make ?? ''} {vehicleInfo.model ?? ''} ({vehicleInfo.year ?? ''}) - {vehicleInfo.color ?? ''}
            </Text>
          </View>

          <View style={styles.providerContainer}>
            <View style={styles.providerInfo}>
              <Text variant="bodyMedium">{item.provider.name}</Text>
              <View style={styles.statusContainer}>
                <MaterialCommunityIcons
                  name={item.status.toLowerCase() === 'completed' ? 'check-circle' : 'clock-outline'}
                  size={16}
                  color={item.status.toLowerCase() === 'completed' ? '#10B981' : '#F59E0B'}
                />
                <Text variant="bodySmall" style={{ marginLeft: 4, color: item.status.toLowerCase() === 'completed' ? '#10B981' : '#F59E0B' }}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search history"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.filterContainer}>
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setFilterMenuVisible(true)}
                icon="filter-variant"
                style={styles.filterButton}
              >
                Filter
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedFilter(null);
                setFilterMenuVisible(false);
              }}
              title="All Services"
            />
            <Menu.Item
              onPress={() => {
                setSelectedFilter('towing');
                setFilterMenuVisible(false);
              }}
              title="Towing"
            />
            <Menu.Item
              onPress={() => {
                setSelectedFilter('gas');
                setFilterMenuVisible(false);
              }}
              title="Gas Delivery"
            />
            <Menu.Item
              onPress={() => {
                setSelectedFilter('mechanic');
                setFilterMenuVisible(false);
              }}
              title="Mechanic"
            />
          </Menu>

          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                style={styles.filterButton}
              >
                Sort
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedSort('date_desc');
                setSortMenuVisible(false);
              }}
              title="Latest First"
            />
            <Menu.Item
              onPress={() => {
                setSelectedSort('date_asc');
                setSortMenuVisible(false);
              }}
              title="Oldest First"
            />
            <Menu.Item
              onPress={() => {
                setSelectedSort('cost_desc');
                setSortMenuVisible(false);
              }}
              title="Highest Cost"
            />
            <Menu.Item
              onPress={() => {
                setSelectedSort('cost_asc');
                setSortMenuVisible(false);
              }}
              title="Lowest Cost"
            />
          </Menu>
        </View>
      </View>

      {selectedFilter && (
        <View style={styles.activeFilters}>
          <Chip
            onClose={() => setSelectedFilter(null)}
            style={styles.filterChip}
          >
            {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
          </Chip>
        </View>
      )}

      <FlatList
        data={filterHistory(historyItems)}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={64} color="#9CA3AF" />
            <Text variant="titleLarge" style={styles.emptyText}>No History Found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeFilters: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceType: {
    marginLeft: 8,
  },
  cost: {
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    marginLeft: 4,
    color: '#6B7280',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    marginLeft: 4,
    color: '#6B7280',
    flex: 1,
  },
  providerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#6B7280',
  },
}); 