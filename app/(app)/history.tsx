import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Text, Card, Chip, Searchbar, Menu, Button, IconButton, useTheme } from 'react-native-paper';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HistoryItem = {
  id: string;
  serviceType: string;
  status: string;
  date: string;
  provider: {
    name: string;
    rating: number;
  };
  cost: number;
  location: string;
};

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    serviceType: 'towing',
    status: 'completed',
    date: '2024-01-20T14:30:00Z',
    provider: {
      name: 'John Smith',
      rating: 4.8,
    },
    cost: 85.00,
    location: '123 Main St, San Francisco, CA',
  },
  {
    id: '2',
    serviceType: 'gas',
    status: 'completed',
    date: '2024-01-15T10:15:00Z',
    provider: {
      name: 'Mike Johnson',
      rating: 4.9,
    },
    cost: 45.00,
    location: '456 Market St, San Francisco, CA',
  },
  // Add more mock data as needed
];

export default function HistoryScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>('date_desc');

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'towing':
        return 'tow-truck';
      case 'gas':
        return 'gas-station';
      case 'mechanic':
        return 'wrench';
      default:
        return 'help';
    }
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

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply service type filter
    if (selectedFilter) {
      filtered = filtered.filter(item => item.serviceType === selectedFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'cost_desc':
          return b.cost - a.cost;
        case 'cost_asc':
          return a.cost - b.cost;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <MaterialCommunityIcons
              name={getServiceIcon(item.serviceType)}
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={styles.serviceType}>
              {item.serviceType.charAt(0).toUpperCase() + item.serviceType.slice(1)}
            </Text>
          </View>
          <Text variant="labelLarge" style={styles.cost}>
            {formatCurrency(item.cost)}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
          <Text variant="bodySmall" style={styles.date}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
          <Text variant="bodySmall" style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        <View style={styles.providerContainer}>
          <View style={styles.providerInfo}>
            <Text variant="bodyMedium">{item.provider.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
              <Text variant="bodySmall">{item.provider.rating}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

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
        data={filterHistory(mockHistory)}
        renderItem={renderHistoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
  locationContainer: {
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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