const fs = require('fs');

let content = fs.readFileSync('src/screens/map/MapScreen.tsx', 'utf8');

// Replace imports
content = content.replace(
  "import Svg, { Defs, LinearGradient, Stop, Rect, Path, G, Text as SvgText } from 'react-native-svg';",
  "import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';"
);

// Replace MapStationNode
content = content.replace(
  /interface MapStationNode \{[\s\S]*?leftPct: number;\n\}/,
  `interface MapStationNode {
  id: string;
  code: string;
  name: string;
  city: string;
  status: 'healthy' | 'monitor' | 'service' | 'nodata';
  statusLabel: string;
  temp: string;
  pressure: string;
  humidity: string;
  healthScore: number;
  latitude: number;
  longitude: number;
}`
);

// Remove projectGpsToMap
content = content.replace(/function projectGpsToMap[\s\S]*?return \{ topPct, leftPct \};\n\}\n/, '');

// Add coords to mock data
const coords = {
  AWS_DEL: { lat: 28.6139, lon: 77.2090 },
  AWS_JAI: { lat: 26.9124, lon: 75.7873 },
  AWS_LKO: { lat: 26.8467, lon: 80.9462 },
  AWS_PNQ: { lat: 18.5204, lon: 73.8567 },
  AWS_BOM: { lat: 18.9067, lon: 72.8147 },
  AWS_HYD: { lat: 17.3850, lon: 78.4867 },
  AWS_BLR: { lat: 12.9716, lon: 77.5946 },
  AWS_CHN: { lat: 13.0827, lon: 80.2707 },
  AWS_CCU: { lat: 22.5726, lon: 88.3639 },
  AWS_GUW: { lat: 26.1445, lon: 91.7362 },
};

content = content.replace(/topPct:\s*\d+,\s*leftPct:\s*\d+,/g, (match, offset, str) => {
  // Try to find the station ID near this match
  const before = str.substring(offset - 250, offset);
  const m = before.match(/id:\s*'([^']+)'/);
  if (m && coords[m[1]]) {
    return `latitude: ${coords[m[1]].lat},\n    longitude: ${coords[m[1]].lon},`;
  }
  return `latitude: 20,\n    longitude: 77,`;
});

// Update displayStations map
content = content.replace(
  /const \{ topPct, leftPct \} = projectGpsToMap\(pt\.latitude, pt\.longitude\);/,
  ''
);
content = content.replace(
  /topPct,\s*leftPct,/,
  'latitude: pt.latitude,\n          longitude: pt.longitude,'
);

// Replace Svg and its contents with MapView
const mapCanvasRegex = /<View style=\{styles\.mapCanvas\}>[\s\S]*?(?=<\!-- Floating Map Utilities \(Top Right\) -->)/;
const newMapCanvas = `<View style={styles.mapCanvas}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
              latitude: 21.0,
              longitude: 78.0,
              latitudeDelta: 30.0,
              longitudeDelta: 30.0,
            }}
            customMapStyle={require('./mapStyle.json')}
            showsUserLocation={false}
            showsCompass={false}
          >
            {filteredStations.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              const nodeColor = getNodeColor(st.status);
              const badgeText = getLayerBadgeContent(st);

              return (
                <Marker
                  key={st.id}
                  coordinate={{ latitude: st.latitude, longitude: st.longitude }}
                  onPress={() => setSelectedStation(st)}
                  style={{ zIndex: isSelected ? 30 : 10 }}
                >
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {(st.status === 'service' || isSelected) && (
                      <View
                        style={[
                          styles.haloRing,
                          {
                            backgroundColor:
                              st.status === 'service' ? 'rgba(186, 26, 26, 0.22)' : 'rgba(0, 97, 148, 0.22)',
                            position: 'absolute'
                          },
                        ]}
                      />
                    )}
                    <View style={[styles.nodeDisc, isSelected && styles.selectedNodeDisc]}>
                      <View style={[styles.innerDot, { backgroundColor: nodeColor }]} />
                    </View>
                    {(isSelected || activeLayer !== 'health' || st.id === 'AWS_DEL' || st.id === 'AWS_PNQ' || st.status === 'nodata') && (
                      <View style={styles.pinLabel}>
                        <Text
                          style={[
                            styles.pinLabelText,
                            st.status === 'service' && { color: Colors.serviceNow },
                            st.status === 'nodata' && { color: Colors.outline },
                          ]}
                          numberOfLines={1}
                        >
                          {badgeText}
                        </Text>
                      </View>
                    )}
                  </View>
                </Marker>
              );
            })}
          </MapView>
          
          `;

content = content.replace(mapCanvasRegex, newMapCanvas);

// Remove the unused stationPin style since we use Marker now
content = content.replace(
  /stationPin: \{[\s\S]*?\},/,
  ''
);

fs.writeFileSync('src/screens/map/MapScreen.tsx', content);
console.log('MapScreen updated');
