import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {Alert} from "@/app/screens/LoginScreen";
import {BookDto} from "@/app/openapi";
import {bookApi} from "@/app/api";

type UserHomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const UserHomeScreen = (props: UserHomeScreenProps) => {
  const [books, setBooks] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });

  const fetchBooks = useCallback((search: string) => {
    bookApi.listBooks({search: search})
      .then(value => setBooks(value.content!))
      .catch(reason => {
        console.error(reason)
        setAlert({
          visible: true,
          title: 'Error',
          message: "Couldn't fetch books",
          type: 'error',
          buttons: [{
            text: 'OK', onPress: () => {
            }
          }],
          onClose: () => {
          }
        });
      }).finally(() => setLoading(false))
    setBooks(books);
  }, []);

  useEffect(() => {
    fetchBooks(searchQuery);
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchBooks(searchQuery);
    });
    return unsubscribe;
  }, [props.navigation, searchQuery]);

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
        <Text style={styles.loadingText}>Loading library ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content"/>

      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Library</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#A0AEC0" style={styles.searchIcon}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un livre..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#A0AEC0"/>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.bookList}
          numColumns={2}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {searchQuery.length > 0 ? (
                <>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="search-outline" size={60} color="#A0AEC0"/>
                  </View>
                  <Text style={styles.emptyTitle}>Aucun résultat trouvé</Text>
                  <Text style={styles.emptyText}>
                    Aucun livre ne correspond à votre recherche. Essayez avec d'autres termes.
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="book-outline" size={60} color="#A0AEC0"/>
                  </View>
                  <Text style={styles.emptyTitle}>Aucun livre disponible</Text>
                  <Text style={styles.emptyText}>
                    Aucun livre n'est disponible dans la bibliothèque pour le moment.
                  </Text>
                </>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Ajout du composant CustomAlert */}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  clearButton: {
    padding: 5,
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
    height: 250,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
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

export default UserHomeScreen;