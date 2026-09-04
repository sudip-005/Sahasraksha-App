import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useMaintenance } from '../../hooks/useMaintenance';
import { WorkOrderCard } from '../../components/maintenance/WorkOrderCard';
import { Card } from '../../components/common/Card';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { EmptyState } from '../../components/common/EmptyState';
import { Colors, Typography, Spacing } from '../../theme';

export const MaintenanceScreen: React.FC = () => {
  const { data, loading, createOrder, refetch } = useMaintenance();
  const [activeTab, setActiveTab] = useState(0); // 0: Service Now, 1: Monitor, 2: Healthy
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [stationId, setStationId] = useState('AWS_DEL_01');
  const [sensorType, setSensorType] = useState('TEMPERATURE');
  const [priority, setPriority] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');

  const tabs = [
    `Service Now (${data?.service_now.length || 0})`,
    `Monitor (${data?.monitor.length || 0})`,
    `Healthy (${data?.healthy.length || 0})`,
  ];

  const handleCreate = async () => {
    if (!description.trim()) return;
    await createOrder({
      station_id: stationId,
      sensor_type: sensorType,
      priority,
      description,
      technician: technician || undefined,
    });
    setDescription('');
    setModalVisible(false);
  };

  const getActiveList = () => {
    if (!data) return [];
    if (activeTab === 0) return data.service_now;
    if (activeTab === 1) return data.monitor;
    return data.healthy;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Field Maintenance</Text>
          <Text style={styles.subtitle}>Work Orders & Sensor Dispatch</Text>
        </View>

        <TouchableOpacity
          style={styles.newOrderBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.newOrderText}>+ NEW ORDER</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentWrapper}>
        <SegmentedControl
          options={tabs}
          selectedIndex={activeTab}
          onSelect={setActiveTab}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.primary} />
        }
      >
        {getActiveList().length === 0 && !loading ? (
          <EmptyState
            title="No Work Orders"
            message="No active work orders under this priority category."
            iconText="✅"
          />
        ) : (
          getActiveList().map((wo) => <WorkOrderCard key={wo.id} order={wo} />)
        )}
      </ScrollView>

      {/* Create Work Order Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispatch Field Work Order</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Station ID</Text>
            <TextInput
              style={styles.input}
              value={stationId}
              onChangeText={setStationId}
              placeholder="e.g. AWS_DEL_01"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Sensor Subsystem</Text>
            <TextInput
              style={styles.input}
              value={sensorType}
              onChangeText={setSensorType}
              placeholder="TEMPERATURE, PRESSURE, HUMIDITY, WIND"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Priority Level</Text>
            <TextInput
              style={styles.input}
              value={priority}
              onChangeText={setPriority}
              placeholder="CRITICAL, HIGH, MEDIUM, LOW"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Assigned Technician</Text>
            <TextInput
              style={styles.input}
              value={technician}
              onChangeText={setTechnician}
              placeholder="Name or IMD Sub-division"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Inspection Instructions</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Detailed fault description and maintenance protocol..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>CONFIRM & DISPATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  newOrderBtn: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Spacing.radiusSm,
  },
  newOrderText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  segmentWrapper: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  closeBtn: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: 'bold',
  },
  inputLabel: {
    ...Typography.small,
    color: Colors.paleCyan,
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: Colors.cardSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radiusSm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusSm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnText: {
    ...Typography.captionBold,
    color: Colors.textInverted,
    fontWeight: '800',
  },
});
