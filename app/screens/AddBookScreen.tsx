import React, {useCallback, useState} from 'react';
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
import {BookDto} from "@/app/openapi";
import {bookApi} from "@/app/api";
import {Alert} from "@/app/screens/LoginScreen"; // Adjust the path as needed

type AddBookScreenProps = NativeStackScreenProps<RootStackParamList, "AddBook">;

const AddBookScreen = (props: AddBookScreenProps) => {

    const [book, setBook] = useState<BookDto>(() => ({
      title: '',
      isbn: '',
      author: '',
      id: 0,
      totalCopies: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }))


    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<Alert>({
      visible: false,
      title: '',
      message: '',
      type: 'success',
      buttons: [],
      onClose: () => {
      }
    });

    const handleSubmit = useCallback((book: BookDto) => {
      setLoading(true);
      bookApi.createBook1({
        bookPostDto: {
          isbn: book.isbn,
          title: book.title,
          totalCopies: book.totalCopies,
          author: book.author
        }
      }).then(value => {
        setBook(value)
        return value
      })
        .then(value => setAlert({
          visible: true,
          title: 'Book added',
          message: 'Book added successfully',
          type: 'success',
          buttons: [{
            text: 'OK',
            onPress: () => {
              props.navigation.navigate("BookDetails", {bookId: value.id});
            }
          }],
          onClose: () => {
          }
        }))
        .catch(reason => setAlert({
          visible: true,
          title: 'Error',
          message: "Couldn't add book",
          type: 'error',
          buttons: [{
            text: 'OK', onPress: () => {
            }
          }],
          onClose: () => {
          }

        }))
        .finally(() => setLoading(false))
    }, []);

    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="light-content"/>

        <LinearGradient
          colors={['#3a416f', '#141727']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => props.navigation.navigate("AdminTabs", {screen: "HomePage"})}
          >
            <Ionicons name="arrow-back" size={24} color="white"/>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add book</Text>
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
                    value={book.title}
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ISBN</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input]}
                    value={book.isbn}
                    onChangeText={isbn => setBook(prevState => ({...prevState, isbn}))}
                    placeholder="ISBN"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Copies</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="list-outline" size={20} color="#666" style={styles.inputIcon}/>
                  <TextInput
                    style={styles.input}
                    value={String(book.totalCopies)}
                    onChangeText={totalCopies => setBook(prevState => ({...prevState, totalCopies: Number(totalCopies)}))}
                    placeholder="Total Copies"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
              </View>


              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={() => handleSubmit(book)}
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
                      <Ionicons name="add-circle-outline" size={20} color="white" style={styles.submitIcon}/>
                      <Text style={styles.submitButtonText}>Ajouter le livre</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
  }
;

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
  required: {
    color: '#E53E3E',
    fontWeight: '500',
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
  pdfPreview: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  pdfIconContainer: {
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  pdfName: {
    flex: 1,
    marginLeft: 12,
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  removePdfButton: {
    padding: 4,
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

export default AddBookScreen;