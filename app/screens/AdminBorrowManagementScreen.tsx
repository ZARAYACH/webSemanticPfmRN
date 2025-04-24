import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import CustomAlert from './CustomAlert';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "@/app/(tabs)/HomePage";
import {BorrowingDto} from "@/app/openapi";
import {Alert} from "@/app/screens/LoginScreen";
import {borrowingApi} from "@/app/api";

type AdminBorrowManagementScreenProps = NativeStackScreenProps<RootStackParamList, "BorrowManagement">;

const AdminBorrowManagementScreen = (props: AdminBorrowManagementScreenProps) => {
  const [borrows, setBorrows] = useState<BorrowingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  const [alert, setAlert] = useState<Alert>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    buttons: [],
    onClose: () => {
    }
  });

  const fetchBorrowRequests = useCallback(() => {
    borrowingApi.listBorrowings()
      .then(value => setBorrows(value))
      .catch(reason => setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible de charger les demandes d\'emprunt',
        type: 'error',
        buttons: [{
          text: 'OK', onPress: () => {
          }
        }],
        onClose: () => {
        }
      })).finally(() => setIsLoading(false))
  }, []);


  useEffect(() => {
    fetchBorrowRequests();
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchBorrowRequests();
    });

    return unsubscribe;
  }, [props.navigation]);


  // Rendre un élément de la liste des demandes
  const renderBorrowItem = (item: BorrowingDto) => {
    // Définir la couleur de statut
    let statusColor;
    let statusText;
    let iconName;

    switch (item.returned) {
      case false:
        statusColor = '#3B82F6';
        statusText = 'Emprunté';
        iconName = 'book-outline';
        break;
      case true:
        statusColor = '#6B7280';
        statusText = 'Retourné';
        iconName = 'return-down-back-outline';
        break;
    }

    const formatDate = (date: Date) => {
      if (!date) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <View style={styles.borrowCard}>
        <View style={styles.borrowHeader}>
          <Text style={styles.bookTitle}>{item.bookTitle}</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
            <Ionicons name={iconName as any} size={16} color="white" style={{marginRight: 5}}/>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.borrowContent}>

          <View style={styles.borrowInfo}>
            <Text style={styles.authorName}>{item.bookAuthor}</Text>

            <View style={styles.userInfoBox}>
              <Ionicons name="person-outline" size={16} color="#4B5563"/>
              <Text style={styles.userInfoText}>user Id {item.userId}</Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color="#666"/>
              <Text style={styles.dateText}>Borrowed: {formatDate(item.borrowDate)}</Text>
            </View>

            {item.dueDate && (
              <View style={styles.dateRow}>
                <Ionicons name="checkmark-outline" size={16} color="#666"/>
                <Text style={styles.dateText}>Due date: {formatDate(item.dueDate)}</Text>
              </View>
            )}

            {item.returnDate && (
              <View style={styles.dateRow}>
                <Ionicons name="log-out-outline" size={16} color="#666"/>
                <Text style={styles.dateText}>returned : {item.returned}</Text>
              </View>
            )}
          </View>
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
        <Text style={styles.headerTitle}>Borrows</Text>
      </LinearGradient>

      <View style={{flex : 1}}>
        <FlatList
          data={borrows}
          renderItem={info => renderBorrowItem(info.item as BorrowingDto)}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={1}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text>Empty</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  searchContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    padding: 15,
  },
  borrowCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
    overflow: 'hidden',
  },
  borrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 15,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  borrowContent: {
    flexDirection: 'row',
    padding: 15,
  },
  coverThumbnail: {
    width: 80,
    height: 120,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  borrowInfo: {
    flex: 1,
    marginLeft: 15,
  },
  authorName: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    marginBottom: 8,
  },
  userInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
  },
  manageButton: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  manageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
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
    color: '#4A5568',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal:
      20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  modalUserInfo: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 15,
  },
  modalQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalQuantityText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  notesInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    color: '#4A5568',
    fontSize: 14,
    marginBottom: 20,
  },
  modalActions: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  returnButton: {
    backgroundColor: '#DD6B20',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  disabledButton: {
    opacity: 0.6,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  }
});

export default AdminBorrowManagementScreen;