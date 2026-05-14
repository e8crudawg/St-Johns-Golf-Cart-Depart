import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const initialCourses = [
  { id: '1', name: 'AMBERWOOD', driveTimeMinutes: 64 },
  { id: '2', name: 'BACALL', driveTimeMinutes: 33 },
  { id: '3', name: 'BEAUTYBERRY', driveTimeMinutes: 27 },
  { id: '4', name: 'BELLAIRE', driveTimeMinutes: 23 },
  { id: '5', name: 'BELLE GLADE', driveTimeMinutes: 28 },
  { id: '6', name: 'BELMONT', driveTimeMinutes: 48 },
  { id: '7', name: 'BOGART', driveTimeMinutes: 33 },
  { id: '8', name: 'BONIFAY', driveTimeMinutes: 25 },
  { id: '9', name: 'BONITA PASS', driveTimeMinutes: 32 },
  { id: '10', name: 'BRIARWOOD', driveTimeMinutes: 61 },
  { id: '11', name: 'CANE GARDEN', driveTimeMinutes: 33 },
  { id: '12', name: 'CHULA VISTA', driveTimeMinutes: 51 },
  { id: '13', name: 'CHURCHILL GREENS', driveTimeMinutes: 48 },
  { id: '14', name: 'DE LA VISTA', driveTimeMinutes: 49 },
  { id: '15', name: 'EL DIABLO', driveTimeMinutes: 57 },
  { id: '16', name: 'EL SANTIAGO', driveTimeMinutes: 57 },
  { id: '17', name: 'ESCAMBIA', driveTimeMinutes: 32 },
  { id: '18', name: 'EVANS PRAIRIE', driveTimeMinutes: 17 },
  { id: '19', name: 'GLENVIEW CHAMPIONS', driveTimeMinutes: 56 },
  { id: '20', name: 'GRAY FOX', driveTimeMinutes: 28 },
  { id: '21', name: 'HACIENDA HILLS', driveTimeMinutes: 51 },
  { id: '22', name: 'HAVANA', driveTimeMinutes: 33 },
  { id: '23', name: 'HAWKES BAY', driveTimeMinutes: 49 },
  { id: '24', name: 'HERON', driveTimeMinutes: 36 },
  { id: '25', name: 'HILL TOP', driveTimeMinutes: 56 },
  { id: '26', name: 'HONEYSUCKLE', driveTimeMinutes: 27 },
  { id: '27', name: 'JUBILEE', driveTimeMinutes: 25 },
  { id: '28', name: 'LAUREL OAK', driveTimeMinutes: 19 },
  { id: '29', name: 'LIVE OAK', driveTimeMinutes: 19 },
  { id: '30', name: 'LOBLOLLY', driveTimeMinutes: 15 },
  { id: '31', name: 'LONGLEAF', driveTimeMinutes: 15 },
  { id: '32', name: 'LOPEZ LEGACY', driveTimeMinutes: 61 },
  { id: '33', name: 'LOWLANDS', driveTimeMinutes: 11 },
  { id: '34', name: 'MALLORY HILL', driveTimeMinutes: 38 },
  { id: '35', name: 'MANGROVE', driveTimeMinutes: 15 },
  { id: '36', name: 'MARSH VIEW', driveTimeMinutes: 12 },
  { id: '37', name: 'MICKYLEE', driveTimeMinutes: 25 },
  { id: '38', name: 'MIRA MESA', driveTimeMinutes: 51 },
  { id: '39', name: 'OAKLEIGH', driveTimeMinutes: 64 },
  { id: '40', name: 'OKEECHOBEE', driveTimeMinutes: 32 },
  { id: '41', name: 'ORANGE BLOSSOM HILLS', driveTimeMinutes: 55 },
  { id: '42', name: 'PALMER LEGENDS', driveTimeMinutes: 40 },
  { id: '43', name: 'PALMETTO', driveTimeMinutes: 16 },
  { id: '44', name: 'PELICAN', driveTimeMinutes: 36 },
  { id: '45', name: 'PIMLICO', driveTimeMinutes: 48 },
  { id: '46', name: 'RED FOX', driveTimeMinutes: 28 },
  { id: '47', name: 'REDFISH RUN', driveTimeMinutes: 33 },
  { id: '48', name: 'RICHMOND', driveTimeMinutes: 5 },
  { id: '49', name: 'ROOSEVELT', driveTimeMinutes: 32 }
];

const csvAsset = require('./data/Course Drive Times.csv');

function parseTimeToMinutes(timeString, period = 'AM') {
  const [hours, minutes] = timeString.split(':').map((value) => Number(value));
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return NaN;
  }
  let normalizedHours = hours;
  if (period === 'PM' && hours < 12) {
    normalizedHours = hours + 12;
  }
  if (period === 'AM' && hours === 12) {
    normalizedHours = 0;
  }
  return normalizedHours * 60 + minutes;
}

function formatTimeInput(text) {
  const digits = text.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  } else if (digits.length === 3) {
    return `${digits.slice(0, 1)}:${digits.slice(1, 3)}`;
  } else if (digits.length === 2) {
    return `${digits}:`;
  } else {
    return digits;
  }
}

function parseCsvToCourses(csvText) {
  return csvText
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line, index) => {
      const [name, driveTime] = line.split(',');
      const minutes = Number(driveTime.replace(/[^0-9]/g, '').trim());
      return {
        id: String(index + 1),
        name: name.trim(),
        driveTimeMinutes: minutes
      };
    })
    .filter((course) => course.name && !Number.isNaN(course.driveTimeMinutes));
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default function App() {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0].id);
  const [arrivalTime, setArrivalTime] = useState('08:00');
  const [arrivalPeriod, setArrivalPeriod] = useState('AM');
  const [bufferMinutes, setBufferMinutes] = useState('20');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const asset = Asset.fromModule(csvAsset);
        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const csvText = await response.text();
          const parsedCourses = parseCsvToCourses(csvText);
          if (parsedCourses.length > 0) {
            setCourses(parsedCourses);
            setSelectedCourseId(parsedCourses[0].id);
          }
          return;
        }

        await asset.downloadAsync();
        const csvText = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
        const parsedCourses = parseCsvToCourses(csvText);
        if (parsedCourses.length > 0) {
          setCourses(parsedCourses);
          setSelectedCourseId(parsedCourses[0].id);
        }
      } catch (error) {
        console.warn('Failed to load course CSV:', error);
      }
    }
    loadCourses();
  }, []);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || courses[0];

  const departureTime = useMemo(() => {
    const arrivalMinutes = parseTimeToMinutes(arrivalTime, arrivalPeriod);
    const buffer = Number(bufferMinutes);
    if (Number.isNaN(arrivalMinutes) || Number.isNaN(buffer) || !selectedCourse) {
      return null;
    }
    const leaveMinutes = arrivalMinutes - selectedCourse.driveTimeMinutes - buffer;
    if (leaveMinutes < 0) {
      return null;
    }
    return formatMinutesToTime(leaveMinutes);
  }, [arrivalTime, bufferMinutes, selectedCourse]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>St. John's{"\n"}Golf Cart Depart</Text>
      
      <Text style={styles.sectionTitle}>Select Course</Text>
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownOpen((current) => !current)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedCourse.name} ({selectedCourse.driveTimeMinutes} min)
          </Text>
          <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {dropdownOpen && (
          <View style={styles.dropdownList}>
            <FlatList
              data={courses}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedCourseId === item.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCourseId(item.id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {item.name} ({item.driveTimeMinutes} min)
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Tee Time</Text>
      <View style={styles.timeInputWrapper}>
        <TextInput
          style={[styles.input, styles.timeInput]}
          value={arrivalTime}
          onChangeText={(text) => setArrivalTime(formatTimeInput(text))}
          placeholder="08:00"
          keyboardType="numeric"
          maxLength={5}
        />
        <View style={styles.amPmInlineContainer}>
          <TouchableOpacity
            style={[
              styles.amPmInlineButton,
              arrivalPeriod === 'AM' && styles.amPmButtonSelected
            ]}
            onPress={() => setArrivalPeriod('AM')}
          >
            <Text style={styles.amPmInlineButtonText}>AM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.amPmInlineButton,
              arrivalPeriod === 'PM' && styles.amPmButtonSelected
            ]}
            onPress={() => setArrivalPeriod('PM')}
          >
            <Text style={styles.amPmInlineButtonText}>PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Arrive Before Tee Time (Minutes)</Text>
      <TextInput
        style={styles.input}
        value={bufferMinutes}
        onChangeText={setBufferMinutes}
        placeholder="20"
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Departure Time</Text>
      <View style={styles.resultBox}>
        {departureTime ? (
          <Text style={styles.resultText}>Leave at {departureTime}</Text>
        ) : (
          <Text style={styles.resultText}>Enter valid time and buffer</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4d8f4a'
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center'
  },
  title: {
    width: '100%',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'Lucida Calligraphy'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
    color: '#ffffff',
    textAlign: 'center',
    width: '100%'
  },
  dropdownContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#27632d',
    borderRadius: 10,
    backgroundColor: '#e8f5e8'
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#e8f5e8'
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#0f3f14',
    textAlign: 'center',
    flex: 1
  },
  dropdownArrow: {
    fontSize: 18,
    color: '#0f3f14'
  },
  dropdownList: {
    width: '100%',
    maxHeight: 320,
    borderTopWidth: 1,
    borderTopColor: '#27632d',
    backgroundColor: '#e8f5e8'
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cfe3cf',
    backgroundColor: '#e8f5e8'
  },
  dropdownItemSelected: {
    backgroundColor: '#d9f1d9'
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#0f3f14',
    textAlign: 'center'
  },
  courseItem: {
    borderWidth: 1,
    borderColor: '#c0d6df',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc'
  },
  courseItemSelected: {
    borderColor: '#3da9fc',
    backgroundColor: '#e6f2ff'
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102a43'
  },
  courseDrive: {
    fontSize: 14,
    color: '#4b6584',
    marginTop: 6
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#27632d',
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#e8f5e8',
    textAlign: 'center'
  },
  timeInputWrapper: {
    width: '100%',
    position: 'relative',
    marginTop: 0,
    marginBottom: 10
  },
  timeInput: {
    paddingRight: 110
  },
  amPmInlineContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  amPmInlineButton: {
    minWidth: 40,
    borderWidth: 1,
    borderColor: '#27632d',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginLeft: 6,
    backgroundColor: '#e8f5e8'
  },
  amPmInlineButtonText: {
    fontSize: 12,
    color: '#0f3f14',
    fontWeight: '700'
  },
  amPmContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10
  },
  amPmButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#27632d',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#e8f5e8'
  },
  amPmButtonSelected: {
    backgroundColor: '#d9f1d9'
  },
  amPmButtonText: {
    fontSize: 16,
    color: '#0f3f14',
    fontWeight: '700'
  },
  csvInput: {
    minHeight: 120,
    marginTop: 6
  },
  button: {
    backgroundColor: '#3da9fc',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  resultBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#27632d',
    borderRadius: 10,
    backgroundColor: '#d6ebd6',
    padding: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f3f14',
    textAlign: 'center'
  },
  helpText: {
    color: '#334e68',
    marginBottom: 8
  }
});
