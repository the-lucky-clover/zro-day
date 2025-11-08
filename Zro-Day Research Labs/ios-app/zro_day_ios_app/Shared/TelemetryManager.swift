import Foundation
import UIKit
import os.log

class TelemetryManager {
    static let shared = TelemetryManager()
    
    private let logger = Logger(subsystem: "com.zrodayresearchlabs.app", category: "TelemetryManager")
    private let userDefaults = UserDefaults.standard
    
    // Configuration
    private var isEnabled = true
    private var apiEndpoint = "https://api.zrodayresearchlabs.com/v1/telemetry"
    private var batchSize = 50
    private var transmissionInterval: TimeInterval = 300 // 5 minutes
    
    // Data collection
    private var telemetryBuffer: [TelemetryEvent] = []
    private var sessionId: String
    private var deviceId: String
    private var transmissionTimer: Timer?
    
    // Privacy settings
    private var dataRetentionPeriod: TimeInterval = 7 * 24 * 3600 // 7 days
    private var anonymizationLevel: AnonymizationLevel = .high
    
    private init() {
        // Generate session and device identifiers
        sessionId = UUID().uuidString
        
        // Use a persistent but anonymous device identifier
        if let storedDeviceId = userDefaults.string(forKey: "anonymousDeviceId") {
            deviceId = storedDeviceId
        } else {
            deviceId = generateAnonymousDeviceId()
            userDefaults.set(deviceId, forKey: "anonymousDeviceId")
        }
    }
    
    func configure() {
        logger.info("Configuring Telemetry Manager...")
        
        loadConfiguration()
        setupTransmissionTimer()
        cleanupOldData()
        
        logger.info("Telemetry Manager configured successfully")
    }
    
    private func loadConfiguration() {
        isEnabled = userDefaults.bool(forKey: "telemetryEnabled")
        
        // Load anonymization level
        if let levelString = userDefaults.string(forKey: "anonymizationLevel"),
           let level = AnonymizationLevel(rawValue: levelString) {
            anonymizationLevel = level
        }
        
        logger.info("Telemetry enabled: \(isEnabled), Anonymization level: \(anonymizationLevel)")
    }
    
    private func setupTransmissionTimer() {
        transmissionTimer?.invalidate()
        
        transmissionTimer = Timer.scheduledTimer(withTimeInterval: transmissionInterval, repeats: true) { [weak self] _ in
            self?.transmitTelemetryData()
        }
    }
    
    private func generateAnonymousDeviceId() -> String {
        // Generate a hash-based anonymous identifier
        let deviceInfo = [
            UIDevice.current.model,
            UIDevice.current.systemVersion,
            String(UIScreen.main.bounds.width),
            String(UIScreen.main.bounds.height)
        ].joined(separator: "|")
        
        return deviceInfo.sha256Hash.prefix(16).description
    }
    
    // MARK: - Data Collection
    
    func recordSecurityScan(results: SecurityScanResults) {
        guard isEnabled else { return }
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .securityScan,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: [
                "networkAnomalies": results.networkAnomalies.count,
                "behavioralAnomalies": results.behavioralAnomalies.count,
                "exploitAttempts": results.exploitAttempts.count,
                "totalAnomalies": results.networkAnomalies.count + results.behavioralAnomalies.count + results.exploitAttempts.count
            ]
        )
        
        addTelemetryEvent(event)
    }
    
    func reportAnomaly(_ anomaly: SecurityAnomaly) {
        guard isEnabled else { return }
        
        let anonymizedData = anonymizeAnomalyData(anomaly)
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .anomalyDetected,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: anonymizedData
        )
        
        addTelemetryEvent(event)
    }
    
    func recordBrowserActivity(url: String, blocked: Bool, reason: String?) {
        guard isEnabled else { return }
        
        let anonymizedUrl = anonymizeUrl(url)
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .browserActivity,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: [
                "urlHash": anonymizedUrl,
                "blocked": blocked,
                "reason": reason ?? "none"
            ]
        )
        
        addTelemetryEvent(event)
    }
    
    func recordKeyboardUsage(keystrokeCount: Int, anomaliesDetected: Int) {
        guard isEnabled else { return }
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .keyboardUsage,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: [
                "keystrokeCount": keystrokeCount,
                "anomaliesDetected": anomaliesDetected,
                "sessionDuration": Date().timeIntervalSince1970
            ]
        )
        
        addTelemetryEvent(event)
    }
    
    func recordAppLaunch() {
        guard isEnabled else { return }
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .appLaunch,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: [
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
                "osVersion": UIDevice.current.systemVersion,
                "deviceModel": UIDevice.current.model
            ]
        )
        
        addTelemetryEvent(event)
    }
    
    func recordPerformanceMetrics(cpuUsage: Double, memoryUsage: Double, batteryLevel: Float) {
        guard isEnabled else { return }
        
        let event = TelemetryEvent(
            id: UUID().uuidString,
            type: .performanceMetrics,
            timestamp: Date(),
            sessionId: sessionId,
            deviceId: deviceId,
            data: [
                "cpuUsage": cpuUsage,
                "memoryUsage": memoryUsage,
                "batteryLevel": batteryLevel
            ]
        )
        
        addTelemetryEvent(event)
    }
    
    private func addTelemetryEvent(_ event: TelemetryEvent) {
        telemetryBuffer.append(event)
        
        // Trigger immediate transmission for critical events
        if event.type == .anomalyDetected || event.type == .criticalThreat {
            transmitTelemetryData()
        }
        
        // Limit buffer size
        if telemetryBuffer.count > batchSize * 2 {
            telemetryBuffer.removeFirst(batchSize)
        }
        
        logger.debug("Added telemetry event: \(event.type)")
    }
    
    // MARK: - Data Anonymization
    
    private func anonymizeAnomalyData(_ anomaly: SecurityAnomaly) -> [String: Any] {
        var data: [String: Any] = [
            "type": anomaly.type,
            "severity": anomaly.severity,
            "indicatorCount": anomaly.indicators.count
        ]
        
        // Apply anonymization based on level
        switch anonymizationLevel {
        case .low:
            data["description"] = anomaly.description
            data["indicators"] = anomaly.indicators
            
        case .medium:
            data["descriptionHash"] = anomaly.description.sha256Hash
            data["indicatorHashes"] = anomaly.indicators.map { $0.sha256Hash }
            
        case .high:
            // Only include type, severity, and count
            break
        }
        
        return data
    }
    
    private func anonymizeUrl(_ url: String) -> String {
        guard let urlObj = URL(string: url) else {
            return url.sha256Hash
        }
        
        switch anonymizationLevel {
        case .low:
            return urlObj.host ?? url.sha256Hash
            
        case .medium:
            return (urlObj.host ?? url).sha256Hash
            
        case .high:
            return url.sha256Hash
        }
    }
    
    // MARK: - Data Transmission
    
    private func transmitTelemetryData() {
        guard isEnabled && !telemetryBuffer.isEmpty else { return }
        
        let eventsToTransmit = Array(telemetryBuffer.prefix(batchSize))
        
        logger.info("Transmitting \(eventsToTransmit.count) telemetry events")
        
        let payload = TelemetryPayload(
            version: "1.0",
            clientType: "ios-app",
            sessionId: sessionId,
            deviceId: deviceId,
            timestamp: Date(),
            events: eventsToTransmit
        )
        
        transmitPayload(payload) { [weak self] success in
            if success {
                // Remove transmitted events from buffer
                self?.telemetryBuffer.removeFirst(min(eventsToTransmit.count, self?.telemetryBuffer.count ?? 0))
                self?.logger.info("Telemetry transmission successful")
            } else {
                self?.logger.error("Telemetry transmission failed")
            }
        }
    }
    
    private func transmitPayload(_ payload: TelemetryPayload, completion: @escaping (Bool) -> Void) {
        guard let url = URL(string: apiEndpoint) else {
            completion(false)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("ZroDayApp/1.0", forHTTPHeaderField: "User-Agent")
        
        // Add API key if available
        if let apiKey = getApiKey() {
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        }
        
        do {
            let jsonData = try JSONEncoder().encode(payload)
            request.httpBody = jsonData
            
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    self.logger.error("Telemetry transmission error: \(error.localizedDescription)")
                    completion(false)
                    return
                }
                
                if let httpResponse = response as? HTTPURLResponse {
                    let success = httpResponse.statusCode == 200
                    completion(success)
                } else {
                    completion(false)
                }
            }.resume()
            
        } catch {
            logger.error("Failed to encode telemetry payload: \(error.localizedDescription)")
            completion(false)
        }
    }
    
    private func getApiKey() -> String? {
        return userDefaults.string(forKey: "apiKey")
    }
    
    // MARK: - Data Management
    
    private func cleanupOldData() {
        // Remove old telemetry events
        let cutoffDate = Date().addingTimeInterval(-dataRetentionPeriod)
        telemetryBuffer.removeAll { $0.timestamp < cutoffDate }
        
        logger.info("Cleaned up old telemetry data")
    }
    
    // MARK: - Configuration
    
    func setTelemetryEnabled(_ enabled: Bool) {
        isEnabled = enabled
        userDefaults.set(enabled, forKey: "telemetryEnabled")
        
        if enabled {
            setupTransmissionTimer()
        } else {
            transmissionTimer?.invalidate()
            telemetryBuffer.removeAll()
        }
        
        logger.info("Telemetry \(enabled ? "enabled" : "disabled")")
    }
    
    func setAnonymizationLevel(_ level: AnonymizationLevel) {
        anonymizationLevel = level
        userDefaults.set(level.rawValue, forKey: "anonymizationLevel")
        
        logger.info("Anonymization level set to: \(level)")
    }
    
    func getTelemetryStats() -> TelemetryStats {
        return TelemetryStats(
            isEnabled: isEnabled,
            eventsInBuffer: telemetryBuffer.count,
            sessionId: sessionId,
            anonymizationLevel: anonymizationLevel,
            lastTransmission: Date() // This would be tracked in a real implementation
        )
    }
}

// MARK: - Data Structures

struct TelemetryEvent: Codable {
    let id: String
    let type: EventType
    let timestamp: Date
    let sessionId: String
    let deviceId: String
    let data: [String: Any]
    
    enum EventType: String, Codable {
        case appLaunch = "app_launch"
        case securityScan = "security_scan"
        case anomalyDetected = "anomaly_detected"
        case browserActivity = "browser_activity"
        case keyboardUsage = "keyboard_usage"
        case performanceMetrics = "performance_metrics"
        case criticalThreat = "critical_threat"
    }
    
    // Custom coding to handle [String: Any]
    enum CodingKeys: String, CodingKey {
        case id, type, timestamp, sessionId, deviceId, data
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(type, forKey: .type)
        try container.encode(timestamp, forKey: .timestamp)
        try container.encode(sessionId, forKey: .sessionId)
        try container.encode(deviceId, forKey: .deviceId)
        
        // Convert [String: Any] to JSON data
        let jsonData = try JSONSerialization.data(withJSONObject: data)
        let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
        try container.encode(jsonString, forKey: .data)
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        type = try container.decode(EventType.self, forKey: .type)
        timestamp = try container.decode(Date.self, forKey: .timestamp)
        sessionId = try container.decode(String.self, forKey: .sessionId)
        deviceId = try container.decode(String.self, forKey: .deviceId)
        
        let jsonString = try container.decode(String.self, forKey: .data)
        if let jsonData = jsonString.data(using: .utf8),
           let dict = try JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
            data = dict
        } else {
            data = [:]
        }
    }
    
    init(id: String, type: EventType, timestamp: Date, sessionId: String, deviceId: String, data: [String: Any]) {
        self.id = id
        self.type = type
        self.timestamp = timestamp
        self.sessionId = sessionId
        self.deviceId = deviceId
        self.data = data
    }
}

struct TelemetryPayload: Codable {
    let version: String
    let clientType: String
    let sessionId: String
    let deviceId: String
    let timestamp: Date
    let events: [TelemetryEvent]
}

struct TelemetryStats {
    let isEnabled: Bool
    let eventsInBuffer: Int
    let sessionId: String
    let anonymizationLevel: AnonymizationLevel
    let lastTransmission: Date
}

enum AnonymizationLevel: String, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
}

// MARK: - String Extension for Hashing

extension String {
    var sha256Hash: String {
        let data = self.data(using: .utf8) ?? Data()
        let hash = data.withUnsafeBytes { bytes in
            return SHA256.hash(data: Data(bytes))
        }
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}

// Simple SHA256 implementation for demonstration
// In a real app, you would use CryptoKit
struct SHA256 {
    static func hash(data: Data) -> [UInt8] {
        // This is a simplified placeholder
        // Use CryptoKit.SHA256 in a real implementation
        return Array(data.prefix(32))
    }
}
