import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {BookDto} from "@/app/openapi";
import CustomAlert from "@/app/screens/CustomAlert";
import {Alert} from "@/app/screens/LoginScreen";
import {bookApi} from "@/app/api";
import {useNavigation} from "@react-navigation/native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "AdminHome">;

const HomeScreen = (props: HomeScreenProps) => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });
  const fetchBooks = useCallback(async () => {
    try {
      bookApi.listBooks({search: searchText})
        .then(value => {
          setBooks(value.content || []);
        }).catch(reason => console.error(reason))

    } catch (error) {
      console.error('Error:', error);
      setAlert({
        onClose: () => {
        },
        visible: true,
        title: 'Erreur',
        message: 'Impossible de charger les livres',
        type: 'error',
        buttons: [{
          text: 'OK', onPress: () => {
          }
        }]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchBooks().then();
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchBooks().then();
    });

    return unsubscribe;
  }, [searchText]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };


  const renderBookItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => props.navigation.navigate('BookDetails', {bookId: item.id})}
      activeOpacity={0.7}
    >
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content"/>
        <ActivityIndicator size="large" color="#4F6CE1"/>
        <Text style={styles.loadingText}>Chargement de votre bibliothèque...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content"/>
      <LinearGradient
        colors={['#000000', '#141727']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Library</Text>

      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A0AEC0" style={styles.searchIcon}/>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un livre ou un auteur"
            placeholderTextColor="#A0AEC0"
            value={searchText}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#A0AEC0"/>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={item => item.id!.toString()}
          contentContainerStyle={styles.bookList}
          numColumns={1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBooks().then();
              }}
              colors={["#4F6CE1"]}
              tintColor="#4F6CE1"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name={searchText.length > 0 ? "search-outline" : "book-outline"}
                  size={60}
                  color="#A0AEC0"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchText.length > 0 ? "Aucun résultat trouvé" : "Aucun livre trouvé"}
              </Text>
              <Text style={styles.emptyText}>
                {searchText.length > 0
                  ? `Aucun livre ne correspond à "${searchText}"`
                  : "Votre bibliothèque est vide. Ajoutez des livres en cliquant sur le bouton ci-dessous."}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bouton d'ajout avec dégradé */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => props.navigation.navigate('AddBook')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#000000', '#141727']}
          style={styles.addButtonGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <Ionicons name="add" size={30} color="white"/>
        </LinearGradient>
      </TouchableOpacity>

      {/* Composant CustomAlert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onClose={() => setAlert(prev => ({...prev, visible: false}))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f6f7fb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    paddingVertical: 2,
  },
  clearButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4F6CE1',
    fontWeight: '500',
  },
  bookList: {
    padding: 15,
    paddingBottom: 80,
  },
  bookCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    height: 80,
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4F6CE1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#2D3748',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    height: 400,
    justifyContent: 'center',
  },
  emptyIconContainer: {
    backgroundColor: 'rgba(160, 174, 192, 0.1)',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;