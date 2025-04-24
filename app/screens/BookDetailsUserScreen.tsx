import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {BookDto} from "@/app/openapi";
import {Alert} from "@/app/screens/LoginScreen";
import {bookApi, borrowingApi} from "@/app/api";


type BookDetailsScreenUserProps = NativeStackScreenProps<RootStackParamList, "DetailsUser">;

const BookDetailsScreenUser = (props: BookDetailsScreenUserProps) => {

  const bookId = props.route.params?.bookId;
  const [book, setBook] = useState<BookDto>({
    title: '',
    isbn: '',
    author: '',
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);

  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });

  const fetchBookDetails = useCallback(async (bookId: number) => {
    setIsLoading(true);
    bookApi.findBookById({id: bookId})
      .then(value => setBook(value))
      .catch(() => {
        setAlert({
          visible: true,
          title: 'Error',
          message: "Couldn't fetch book ",
          type: 'error',
          buttons: [{
            text: 'OK', onPress: () => {
            }
          }],
          onClose: () => {
          }
        });
      }).finally(() => setIsLoading(false))

  }, []);

  useEffect(() => {
    if (!bookId) {
      setIsLoading(false);
      return;
    }
    fetchBookDetails(bookId).then();
  }, [bookId]);

  const handleBorrow = useCallback((bookId: number) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7)
    borrowingApi.borrowBook({borrowingPostDto: {bookId: bookId, borrowDate: new Date(), dueDate: dueDate}})
      .then(() => setAlert({
        visible: true,
        title: 'Borrowed',
        message: 'Book Borrowed successfully',
        type: 'success',
        buttons: [{
          text: 'OK', onPress: () => {
            props.navigation.goBack()
          }
        }],
        onClose: () => {
        }
      })).catch(reason => {
      console.error(reason);
      setAlert({
        visible: true,
        title: 'Error',
        message: "Couldn't borrow book ",
        type: 'error',
        buttons: [{
          text: 'OK', onPress: () => {
          }
        }], onClose: () => {
        }
      })
    }).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CE1"/>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!bookId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#E53E3E"/>
        <Text style={styles.errorText}>Unknown Book id</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => props.navigation.goBack()}
        >
          <LinearGradient
            colors={['#4F6CE1', '#7D55F3']}
            style={styles.errorButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#E53E3E"/>
        <Text style={styles.errorText}>Can't load bookd details</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => props.navigation.goBack()}
        >
          <LinearGradient
            colors={['#4F6CE1', '#7D55F3']}
            style={styles.errorButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
          >
            <Text style={styles.errorButtonText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.navigate("UserTabs", {screen: "Home"})}
        >
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Books details</Text>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>

          <View style={styles.infoSection}>
            <Text style={styles.bookTitle}>{book.title}</Text>

            <View style={styles.authorRow}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.authorIcon}/>
              <Text style={styles.authorName}>{book.author}</Text>
            </View>

            <View style={styles.divider}/>

            <Text style={styles.sectionTitle}>ISBN</Text>
            <Text style={styles.descriptionText}>{book.isbn}</Text>

            <Text style={styles.sectionTitle}>Quantité disponible</Text>
            <View style={styles.quantityContainer}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.quantityIcon}/>
              <Text style={styles.quantityText}>{book.availableCopies || 0}</Text>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.actionButton]}
                onPress={event => handleBorrow(bookId)}
                disabled={book.availableCopies! < 0}
              >
                <LinearGradient
                  colors={['#020609FF', '#020609FF']}
                  style={styles.errorButtonGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Ionicons
                    name={book.availableCopies! < 0 ? "alert-circle-outline" : "book-outline"}
                    size={22}
                    color="white"
                  />
                  <Text style={styles.actionText}>Borrow book</Text>
                </LinearGradient>

              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageSection: {
    height: 240,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    padding: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorIcon: {
    marginRight: 8,
  },
  authorName: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 20,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityIcon: {
    marginRight: 8,
  },
  quantityText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: "#5737a3",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f6f7fb',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '50%',
  },
  errorButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BookDetailsScreenUser;