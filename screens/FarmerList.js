import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, RefreshControl, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DESIGN from '../src/theme';
import { navigation } from '../navigation/NavigationService';
import apiClient from '../src/api/client';

const SearchBar = ({ searchQuery, setSearchQuery, onClose }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  return (
    <View style={styles.searchContainer}>
      <FontAwesome
        name="search"
        size={20}
        color={DESIGN.colors.textSecondary}
        style={{ marginRight: DESIGN.spacing.xs }}
      />
      <TextInput
        ref={inputRef}
        style={styles.searchInput}
        placeholder="Search by Farmer name, location..."
        placeholderTextColor={DESIGN.colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity onPress={onClose}>
        <FontAwesome
          name="times-circle"
          size={28}
          color={DESIGN.colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
};

function FarmerList() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [farmers, setFarmers] = useState([]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("farmer/individual/");
      console.log("Farmer list", response.data);
      setFarmers(response.data || []);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      Alert.alert("Error", "Failed to fetch farmers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFarmers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleCallFarmer = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((error) => {
      console.error("Error opening dialer:", error);
      Alert.alert("Error", "Failed to open phone dialer.");
    });
  };


  const query = searchQuery?.toLowerCase() || '';
  const dataToRender = showSearch
    ? farmers.filter(farmer =>
      (farmer?.farmer_name?.toLowerCase() || '').includes(query) ||
      (farmer?.mobile_no?.toLowerCase() || '').includes(query) ||
      (farmer?.city?.toLowerCase() || '').includes(query) ||
      (farmer?.state?.name?.toLowerCase() || '').includes(query) ||
      (farmer?.district?.name?.toLowerCase() || '').includes(query) ||
      (farmer?.taluka?.name?.toLowerCase() || '').includes(query)
    )
    : farmers;

  const renderFarmerItem = (farmer) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <MaterialIcons name="person" size={24} color="#4CAF50" />
          <Text style={styles.farmerName}>{farmer.farmer_name || "N/A"}</Text>
          {farmer.mobile_no && (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallFarmer(farmer.mobile_no)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={18} color="#666" />
          <Text style={styles.infoText}>{farmer.mobile_no || "N/A"}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={18} color="#666" />
          <Text style={styles.infoText}>
            {[farmer.taluka?.name, farmer.district?.name, farmer.state?.name]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </Text>
        </View>
        {farmer.crop_details && farmer.crop_details.length > 0 && (
          <View style={styles.infoRow}>
            <MaterialIcons name="eco" size={18} color="#666" />
            <Text style={styles.infoText}>
              {farmer.crop_details.map((cropItem, index) => (
                <Text key={index}>
                  {cropItem.crop.name}
                  {index < farmer.crop_details.length - 1 ? ", " : ""}
                </Text>
              ))}
            </Text>
          </View>
        )}


      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={DESIGN.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Farmer List</Text>
        <TouchableOpacity onPress={() => {
          if (showSearch) {
            setShowSearch(false);
            setSearchQuery("");
          } else {
            setShowSearch(true);
          }
        }}>
          <FontAwesome name="search" size={24} color="black" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <SearchBar
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {loading ? (
        <ActivityIndicator
          animating={true}
          color={DESIGN.colors.primary}
          size="large"
          hidesWhenStopped={true}
          style={{
            marginTop: 20,
            alignSelf: "center",
            transform: [{ scale: 1.2 }], // slightly bigger
          }}
        />

      ) : (
        <FlatList
          data={dataToRender}
          renderItem={({ item }) => renderFarmerItem(item)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 16, marginTop: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[DESIGN.colors.primary]}
              tintColor={DESIGN.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="agriculture" size={80} color={DESIGN.colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Farmers Found</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No farmers match your search criteria"
                  : "You haven't added any farmers yet"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DESIGN.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: DESIGN.colors.border,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DESIGN.colors.surface,
    marginVertical: DESIGN.spacing.sm,
    borderRadius: DESIGN.borderRadius.sm,
    paddingHorizontal: DESIGN.spacing.xs,
    marginHorizontal: DESIGN.spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: DESIGN.typography.body.fontSize,
    paddingHorizontal: DESIGN.spacing.sm,
    color: DESIGN.colors.textPrimary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    marginHorizontal: DESIGN.spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoTextSmall: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DESIGN.colors.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN.colors.textSecondary,
    textAlign: 'center',
  },
});

export default FarmerList;