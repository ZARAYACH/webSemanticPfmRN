import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
import {bookApi} from "@/app/api";
import {BookDto} from "@/app/openapi";

type EditBookScreenProps = NativeStackScreenProps<RootStackParamList, "EditBook">;

const EditBookScreen = (props: EditBookScreenProps) => {
  const {bookId} = props.route.params;
  const [book, setBook] = useState<BookDto>({
    title: '',
    isbn: '',
    author: '',
    id: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertProps, setAlertProps] = useState<Alert>({
    title: '',
    message: '',
    type: 'success',
    buttons: [{
      text: 'OK', onPress: () => {
      }
    }],
    onClose: () => {
    },
    visible: true
  });

  const showCustomAlert = (title: string, message: string, type = 'success', buttons = [{
    text: 'OK', onPress: () => {
    }
  }]) => {
    setAlertProps({
      title, message, type, buttons, visible: true, onClose: () => {
      }
    });
    setAlertVisible(true);
  };
  const fetchBookDetails = useCallback(() => {
    setIsLoading(true);
    bookApi.findBookById({id: bookId})
      .then(value => setBook(value))
      .then(() => setIsLoading(false))
      .catch(reason => {
        showCustomAlert('Error', 'Cant load books', 'error', [
          {text: 'OK', onPress: () => props.navigation.navigate("BookDetails", {bookId})}
        ]);
      }).finally(() => setIsLoading(false))
  }, []);
  useEffect(() => {
    fetchBookDetails();
  }, [bookId, props.navigation]);

  const handleSubmit = async () => {
    setLoading(true);
    bookApi.updateBook({
      id: bookId,
      bookPostDto: {author: book?.author!, title: book?.title!, isbn: book?.isbn!, totalCopies: book?.totalCopies}
    }).then(value => setBook(value))
      .then(() => showCustomAlert('Updated', 'Book was updated successfully', 'success', [
        {text: 'OK', onPress: () => props.navigation.navigate("BookDetails", {bookId: bookId})}
      ]))
      .catch(() => {
        showCustomAlert('Error', "Couldn't update book ", 'error');
      }).finally(() => {
      setLoading(false);
    })
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CE1"/>
        <Text style={styles.loadingText}>Chargement des données...</Text>
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
          onPress={() => props.navigation.navigate("BookDetails", {bookId})}
        >
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update book</Text>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titre</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="book-outline" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  value={book?.title}
                  onChangeText={title => setBook(prevState => ({...prevState, title}))}
                  placeholder="Title"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Auteur</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon}/>
                <TextInput
                  style={styles.input}
                  value={book.author}
                  onChangeText={author => setBook(prevState => ({...prevState, author}))}
                  placeholder="Author"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ISBN</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.inputIcon}/>
              <TextInput
                style={styles.input}
                value={String(book.isbn || 0)}
                onChangeText={isbn => setBook(prevState => ({
                  ...prevState, isbn
                }))}
                placeholder="ISBN"
                placeholderTextColor="#999"
                keyboardType="default"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available copies</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="list-outline" size={20} color="#666" style={styles.inputIcon}/>
              <TextInput
                style={styles.input}
                value={String(book.totalCopies || 0)}
                onChangeText={availableCopies => setBook(prevState => ({
                  ...prevState,
                  availableCopies: Number(availableCopies)
                }))}
                placeholder="Quantité disponible"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertProps.title}
        message={alertProps.message}
        type={alertProps.type}
        buttons={alertProps.buttons}
        onClose={() => setAlertVisible(false)}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={loading ? ['#90CDF4', '#BEE3F8'] : ['#2B6CB0', '#1A365D']}
          style={styles.submitGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white"/>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" style={styles.submitIcon}/>
              <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
    ;
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f6f7fb',
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
    padding: 20,
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4A5568',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#2D3748',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  uploadSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  uploadGroup: {
    marginBottom: 16,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  previewContainer: {
    position: 'relative',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 2,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditBookScreen;