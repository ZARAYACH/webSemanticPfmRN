import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {bookApi} from "@/app/api";
import {BookDto} from "@/app/openapi";
import {Alert} from "@/app/screens/LoginScreen";

type BookDetailsScreenProps = NativeStackScreenProps<RootStackParamList, "BookDetails">;

const BookDetailsScreen = (props: BookDetailsScreenProps) => {
  const {bookId} = props.route.params;
  const [book, setBook] = useState<BookDto | undefined>(undefined);
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

  useEffect(() => {
    const fetchBookDetails = async () => {
      setIsLoading(true);

      bookApi.findBookById({id: bookId})
        .then(value => setBook(value))
        .then(() => setIsLoading(false))
        .catch(reason => {
          console.error(reason)
          setAlert({
            visible: true,
            title: 'Error',
            message: "Couldn't fetch books details ",
            type: 'error',
            buttons: [{
              text: 'OK',
              onPress: () => props.navigation.navigate("AdminHome")
            }],
            onClose: () => {
            }
          });
          setIsLoading(false);
        })
    };

    fetchBookDetails().then(r => {
    });
  }, [bookId, props.navigation]);

  const handleDelete = async () => {
    setAlert({
      visible: true,
      title: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce livre ?',
      type: 'warning',
      onClose: () => {
      },
      buttons: [
        {
          text: 'Cancel',
          onPress: () => {
          }
        },
        {
          text: 'Delete',
          onPress: async () => {
            setIsLoading(true);
            bookApi.deleteBook({id: bookId})
              .then(value => {
                setAlert({
                  visible: true,
                  title: 'Deleted',
                  message: 'Book deleted successfully',
                  type: 'success',
                  buttons: [{
                    text: 'OK',
                    onPress: () => props.navigation.navigate("AdminHome")
                  }],
                  onClose: () => {
                  }
                });
              }).catch(reason => {
              console.error(reason)
              setAlert({
                visible: true,
                title: 'Error',
                message: 'Server Error',
                type: 'error',
                buttons: [{
                  text: 'OK', onPress: () => {
                  }
                }],
                onClose: () => {
                }
              });
            }).finally(() => {
              setIsLoading(false);

            })

          }
        }
      ]
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CE1"/>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#E53E3E"/>
        <Text style={styles.errorText}>Impossible de charger les détails du livre</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => props.navigation.navigate("AdminHome")}
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

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content"/>

      {/* En-tête avec titre */}
      <LinearGradient
        colors={['#3a416f', '#141727']}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => props.navigation.navigate("AdminHome")}
        >
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du livre</Text>
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
            <View style={styles.quantityContainer}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.quantityIcon}/>
              <Text style={styles.quantityText}>{book.isbn || 1}</Text>
            </View>

            <Text style={styles.sectionTitle}>Quantité disponible</Text>
            <View style={styles.quantityContainer}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.quantityIcon}/>
              <Text style={styles.quantityText}>{book.availableCopies || 1}</Text>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => props.navigation.navigate('EditBook', {bookId: book.id})}
              >
                <LinearGradient
                  colors={['#4F6CE1', '#7D55F3']}
                  style={styles.actionGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Ionicons name="create-outline" size={22} color="white"/>
                  <Text style={styles.actionText}>Update</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <LinearGradient
                  colors={['#E53E3E', '#C53030']}
                  style={styles.actionGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                >
                  <Ionicons name="trash-outline" size={22} color="white"/>
                  <Text style={styles.actionText}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CustomAlert component */}
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imageSection: {
    height: 250,
    width: '100%',
    backgroundColor: '#f0f2f5',
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
    fontSize: 16,
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
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A5568',
    marginBottom: 20,
  },
  actionsSection: {
    marginTop: 10,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '500',
  },
  errorButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '60%',
    marginTop: 20,
  },
  errorButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  quantityIcon: {
    marginRight: 10,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
});

export default BookDetailsScreen;