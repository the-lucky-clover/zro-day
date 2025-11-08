import SafariServices
import Foundation
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    
    private let logger = Logger(subsystem: "com.zrodayresearchlabs.browserwatchdog", category: "ExtensionHandler")
    
    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems.first as? NSExtensionItem
        let message = item?.userInfo?[SFExtensionMessageKey]
        
        logger.info("Received message from extension: \(String(describing: message))")
        
        guard let messageDict = message as? [String: Any],
              let messageType = messageDict["type"] as? String else {
            logger.error("Invalid message format")
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        switch messageType {
        case "getThreatStats":
            handleGetThreatStats(context: context)
            
        case "updateThreatDatabase":
            handleUpdateThreatDatabase(context: context, data: messageDict["data"])
            
        case "reportAnomaly":
            handleReportAnomaly(context: context, data: messageDict["data"])
            
        case "getSettings":
            handleGetSettings(context: context)
            
        case "updateSettings":
            handleUpdateSettings(context: context, settings: messageDict["settings"])
            
        default:
            logger.warning("Unknown message type: \(messageType)")
            context.completeRequest(returningItems: [], completionHandler: nil)
        }
    }
    
    private func handleGetThreatStats(context: NSExtensionContext) {
        let threatStats = ThreatStatsManager.shared.getStats()
        
        let response = NSExtensionItem()
        response.userInfo = [
            SFExtensionMessageKey: [
                "type": "threatStatsResponse",
                "data": threatStats
            ]
        ]
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func handleUpdateThreatDatabase(context: NSExtensionContext, data: Any?) {
        guard let threatData = data as? [[String: Any]] else {
            logger.error("Invalid threat database data")
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        ThreatDatabaseManager.shared.updateDatabase(with: threatData) { [weak self] success in
            let response = NSExtensionItem()
            response.userInfo = [
                SFExtensionMessageKey: [
                    "type": "updateThreatDatabaseResponse",
                    "success": success
                ]
            ]
            
            context.completeRequest(returningItems: [response], completionHandler: nil)
        }
    }
    
    private func handleReportAnomaly(context: NSExtensionContext, data: Any?) {
        guard let anomalyData = data as? [String: Any] else {
            logger.error("Invalid anomaly data")
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        AnomalyReporter.shared.reportAnomaly(anomalyData) { [weak self] success in
            let response = NSExtensionItem()
            response.userInfo = [
                SFExtensionMessageKey: [
                    "type": "reportAnomalyResponse",
                    "success": success
                ]
            ]
            
            context.completeRequest(returningItems: [response], completionHandler: nil)
        }
    }
    
    private func handleGetSettings(context: NSExtensionContext) {
        let settings = SettingsManager.shared.getSettings()
        
        let response = NSExtensionItem()
        response.userInfo = [
            SFExtensionMessageKey: [
                "type": "settingsResponse",
                "data": settings
            ]
        ]
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func handleUpdateSettings(context: NSExtensionContext, settings: Any?) {
        guard let settingsDict = settings as? [String: Any] else {
            logger.error("Invalid settings data")
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        SettingsManager.shared.updateSettings(settingsDict) { success in
            let response = NSExtensionItem()
            response.userInfo = [
                SFExtensionMessageKey: [
                    "type": "updateSettingsResponse",
                    "success": success
                ]
            ]
            
            context.completeRequest(returningItems: [response], completionHandler: nil)
        }
    }
}

// MARK: - Supporting Classes

class ThreatStatsManager {
    static let shared = ThreatStatsManager()
    private let userDefaults = UserDefaults.standard
    
    private init() {}
    
    func getStats() -> [String: Any] {
        return [
            "totalThreatsBlocked": userDefaults.integer(forKey: "totalThreatsBlocked"),
            "phishingBlocked": userDefaults.integer(forKey: "phishingBlocked"),
            "malwareBlocked": userDefaults.integer(forKey: "malwareBlocked"),
            "trackersBlocked": userDefaults.integer(forKey: "trackersBlocked"),
            "anomaliesDetected": userDefaults.integer(forKey: "anomaliesDetected"),
            "lastScanTime": userDefaults.object(forKey: "lastScanTime") as? Date ?? Date(),
            "protectionEnabled": userDefaults.bool(forKey: "protectionEnabled")
        ]
    }
    
    func incrementThreatCount(type: String) {
        let currentCount = userDefaults.integer(forKey: type)
        userDefaults.set(currentCount + 1, forKey: type)
        
        let totalCount = userDefaults.integer(forKey: "totalThreatsBlocked")
        userDefaults.set(totalCount + 1, forKey: "totalThreatsBlocked")
        
        userDefaults.set(Date(), forKey: "lastScanTime")
    }
}

class ThreatDatabaseManager {
    static let shared = ThreatDatabaseManager()
    private let logger = Logger(subsystem: "com.zrodayresearchlabs.browserwatchdog", category: "ThreatDatabase")
    
    private init() {}
    
    func updateDatabase(with data: [[String: Any]], completion: @escaping (Bool) -> Void) {
        DispatchQueue.global(qos: .background).async {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: data)
                let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                let databaseURL = documentsPath.appendingPathComponent("threat_database.json")
                
                try jsonData.write(to: databaseURL)
                
                self.logger.info("Threat database updated successfully")
                DispatchQueue.main.async {
                    completion(true)
                }
            } catch {
                self.logger.error("Failed to update threat database: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(false)
                }
            }
        }
    }
    
    func loadDatabase() -> [[String: Any]]? {
        do {
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let databaseURL = documentsPath.appendingPathComponent("threat_database.json")
            
            let data = try Data(contentsOf: databaseURL)
            let threats = try JSONSerialization.jsonObject(with: data) as? [[String: Any]]
            
            return threats
        } catch {
            logger.error("Failed to load threat database: \(error.localizedDescription)")
            return nil
        }
    }
}

class AnomalyReporter {
    static let shared = AnomalyReporter()
    private let logger = Logger(subsystem: "com.zrodayresearchlabs.browserwatchdog", category: "AnomalyReporter")
    
    private init() {}
    
    func reportAnomaly(_ data: [String: Any], completion: @escaping (Bool) -> Void) {
        guard let apiKey = SettingsManager.shared.getApiKey() else {
            logger.error("No API key available for anomaly reporting")
            completion(false)
            return
        }
        
        var request = URLRequest(url: URL(string: "https://api.zrodayresearchlabs.com/v1/anomalies")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data)
            request.httpBody = jsonData
            
            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                if let error = error {
                    self?.logger.error("Failed to report anomaly: \(error.localizedDescription)")
                    completion(false)
                    return
                }
                
                if let httpResponse = response as? HTTPURLResponse {
                    let success = httpResponse.statusCode == 200
                    self?.logger.info("Anomaly report \(success ? "successful" : "failed")")
                    completion(success)
                } else {
                    completion(false)
                }
            }.resume()
            
        } catch {
            logger.error("Failed to serialize anomaly data: \(error.localizedDescription)")
            completion(false)
        }
    }
}

class SettingsManager {
    static let shared = SettingsManager()
    private let userDefaults = UserDefaults.standard
    
    private init() {
        // Set default values
        if userDefaults.object(forKey: "protectionEnabled") == nil {
            userDefaults.set(true, forKey: "protectionEnabled")
        }
        if userDefaults.object(forKey: "anomalyDetectionEnabled") == nil {
            userDefaults.set(true, forKey: "anomalyDetectionEnabled")
        }
        if userDefaults.object(forKey: "telemetryEnabled") == nil {
            userDefaults.set(true, forKey: "telemetryEnabled")
        }
    }
    
    func getSettings() -> [String: Any] {
        return [
            "protectionEnabled": userDefaults.bool(forKey: "protectionEnabled"),
            "anomalyDetectionEnabled": userDefaults.bool(forKey: "anomalyDetectionEnabled"),
            "telemetryEnabled": userDefaults.bool(forKey: "telemetryEnabled"),
            "sensitivityLevel": userDefaults.string(forKey: "sensitivityLevel") ?? "medium",
            "apiKey": getApiKey() ?? ""
        ]
    }
    
    func updateSettings(_ settings: [String: Any], completion: @escaping (Bool) -> Void) {
        for (key, value) in settings {
            userDefaults.set(value, forKey: key)
        }
        
        completion(true)
    }
    
    func getApiKey() -> String? {
        return userDefaults.string(forKey: "apiKey")
    }
    
    func setApiKey(_ key: String) {
        userDefaults.set(key, forKey: "apiKey")
    }
}
