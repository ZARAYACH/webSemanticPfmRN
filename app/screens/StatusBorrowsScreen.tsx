import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {BorrowingDto} from "@/app/openapi";
import {Alert} from "@/app/screens/LoginScreen";
import {borrowingApi} from "@/app/api";
import {formatDate} from "tough-cookie";

type StatusBorrowsScreenProps = NativeStackScreenProps<RootStackParamList, "StatusBorrows">;

const StatusBorrowsScreen = (props: StatusBorrowsScreenProps) => {
  const [borrowRequests, setBorrowRequests] = useState<BorrowingDto[]>([]);
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

  const fetchBorrowRequests = () => {
    borrowingApi.listMyBorrowings()
      .then(value => setBorrowRequests(value))
      .catch(reason => {
        setAlert({
          visible: true,
          title: 'Error',
          message: "Couldn't fetch borrows ",
          type: 'error',
          buttons: [{
            text: 'OK', onPress: () => {
            }
          }],
          onClose: () => {
          }
        });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBorrowRequests();
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchBorrowRequests();
    });
    return unsubscribe;
  }, [props.navigation]);

  const handleReturnBorrowing = (borrowingId: number) => {
    setIsLoading(true);
    borrowingApi.returnBook({id: borrowingId})
      .then(value => fetchBorrowRequests())
      .then(reason => setAlert({
        visible: true,
        title: 'Success',
        message: 'Book returned',
        type: 'success',
        buttons: [{
          text: 'OK', onPress: () => {
          }
        }],
        onClose: () => {
        }
      })).catch(reason => setAlert({
      visible: true,
      title: 'Error',
      message: "Couldn't return book",
      type: 'error',
      buttons: [{
        text: 'OK', onPress: () => {
        }
      }], onClose: () => {
      }
    }))
      .finally(() => setIsLoading(false))
    fetchBorrowRequests();
  };

  const renderBorrowItem = (item: BorrowingDto) => {
    let statusColor;
    let statusText;
    let iconName = "book-outline";

    switch (item.returned) {
      case false:
        statusColor = '#3B82F6';
        statusText = 'Borrowed';
        break;
      case true:
        statusColor = '#6B7280';
        statusText = 'Returned';
        break;
    }
    return (
      <View style={styles.borrowCard}>
        <View style={styles.borrowHeader}>
          <Text style={styles.bookTitle}>{item.bookTitle}</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
            <Ionicons name={item.returned ? 'book-outline' : 'return-down-back-outline'} size={16} color="white"
                      style={{marginRight: 5}}/>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.borrowContent}>

          <View style={styles.borrowInfo}>
            <Text style={styles.authorName}>book title : {item.bookTitle}</Text>
            <Text style={styles.authorName}>book author : {item.bookAuthor}</Text>

            {item.dueDate && (
              <View style={styles.dateRow}>
                <Ionicons name="checkmark-outline" size={16} color="#666"/>
                <Text style={styles.dateText}>Return Due date: {formatDate(item.dueDate)}</Text>
              </View>
            )}

            {item.borrowDate && (
              <View style={styles.dateRow}>
                <Ionicons name="log-out-outline" size={16} color="#666"/>
                <Text style={styles.dateText}>Borrowed: {formatDate(item.borrowDate)}</Text>
              </View>
            )}

            {item.returnDate && (
              <View style={styles.dateRow}>
                <Ionicons name="log-in-outline" size={16} color="#666"/>
                <Text style={styles.dateText}>Returned: {formatDate(item.returnDate)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.borrowActions}>
          {
            !item.returned && <TouchableOpacity
                  disabled={item.returned}
                  style={styles.actionButton}
                  onPress={() => handleReturnBorrowing(item.id)}
              >
                  <LinearGradient
                      colors={['#3B82F6', '#2563EB']}
                      style={styles.actionGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                  >
                      <Ionicons name="return-down-back-outline" size={20} color="white"/>
                      <Text style={styles.actionText}>Return</Text>
                  </LinearGradient>
              </TouchableOpacity>
          }


        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CE1"/>
        <Text style={styles.loadingText}>Chargement...</Text>
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
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My borrows</Text>
      </LinearGradient>

      {borrowRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={60} color="#CBD5E0"/>
          <Text style={styles.emptyText}>You have no borrows</Text>
          <Text style={styles.emptySubText}>
            Go borrow some books and get educated.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => props.navigation.navigate('UserTabs', {screen: "StatusBorrows"})}
          >
            <LinearGradient
              colors={['#4F6CE1', '#7D55F3']}
              style={styles.browseButtonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Ionicons name="library-outline" size={22} color="white"/>
              <Text style={styles.browseButtonText}>Explore library</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={borrowRequests}
          renderItem={info => renderBorrowItem(info.item as BorrowingDto)}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchBorrowRequests}
        />
      )}

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
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4B5563',
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
  listContainer: {
    padding: 16,
  },
  borrowCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  borrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  borrowContent: {
    flexDirection: 'row',
  },
  coverThumbnail: {
    width: 70,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  borrowInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  notesContainer: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  borrowActions: {
    marginTop: 16,
    flexDirection: 'column',
  },
  actionButton: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewButtonDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    opacity: 0.5,
  },
  viewButtonTextDisabled: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 8,
    overflow: 'hidden',
    width: '80%',
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default StatusBorrowsScreen;