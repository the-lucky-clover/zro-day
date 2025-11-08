import UIKit
import SafariServices
import os.log

class SettingsViewController: UIViewController {
    
    private let logger = Logger(subsystem: "com.zrodayresearchlabs.app", category: "Settings")
    private let settingsManager = SettingsManager.shared
    private let telemetryManager = TelemetryManager.shared
    private let securityManager = SecurityManager.shared
    
    // UI Elements
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    
    private let generalSettingsSection = UIStackView()
    private let protectionToggle = UISwitch()
    private let sensitivitySlider = UISlider()
    private let sensitivityLabel = UILabel()
    
    private let telemetrySettingsSection = UIStackView()
    private let telemetryToggle = UISwitch()
    private let anonymizationLevelSegmentedControl = UISegmentedControl(items: AnonymizationLevel.allCases.map { $0.rawValue.capitalized })
    
    private let advancedSettingsSection = UIStackView()
    private let verboseLoggingToggle = UISwitch()
    private let logsViewerButton = UIButton(type: .system)
    private let exportLogsButton = UIButton(type: .system)
    
    private let piiRemovalSection = UIStackView()
    private let piiRemovalStatusLabel = UILabel()
    private let managePiiButton = UIButton(type: .system)
    
    private let subscriptionSection = UIStackView()
    private let subscriptionStatusLabel = UILabel()
    private let manageSubscriptionButton = UIButton(type: .system)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        loadSettings()
    }
    
    private func setupUI() {
        view.backgroundColor = .systemGroupedBackground
        navigationItem.title = "Settings"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        // Close button
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .done,
            target: self,
            action: #selector(doneButtonTapped)
        )
        
        // Scroll View
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        
        contentView.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(contentView)
        
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),
            
            contentView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.width)
        ])
        
        // Main Stack View
        let mainStack = UIStackView()
        mainStack.axis = .vertical
        mainStack.spacing = 20
        mainStack.isLayoutMarginsRelativeArrangement = true
        mainStack.layoutMargins = UIEdgeInsets(top: 20, left: 16, bottom: 20, right: 16)
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(mainStack)
        
        NSLayoutConstraint.activate([
            mainStack.topAnchor.constraint(equalTo: contentView.topAnchor),
            mainStack.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            mainStack.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            mainStack.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])
        
        // Add sections
        mainStack.addArrangedSubview(createSection(title: "General Security", content: generalSettingsSection))
        mainStack.addArrangedSubview(createSection(title: "Telemetry & Privacy", content: telemetrySettingsSection))
        mainStack.addArrangedSubview(createSection(title: "Advanced", content: advancedSettingsSection))
        mainStack.addArrangedSubview(createSection(title: "PII Removal", content: piiRemovalSection))
        mainStack.addArrangedSubview(createSection(title: "Subscription", content: subscriptionSection))
        
        setupGeneralSettings()
        setupTelemetrySettings()
        setupAdvancedSettings()
        setupPiiRemovalSection()
        setupSubscriptionSection()
    }
    
    private func createSection(title: String, content: UIStackView) -> UIView {
        let containerView = UIView()
        containerView.backgroundColor = .secondarySystemGroupedBackground
        containerView.layer.cornerRadius = 12
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOpacity = 0.05
        containerView.layer.shadowOffset = CGSize(width: 0, height: 2)
        containerView.layer.shadowRadius = 4
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = UIFont.preferredFont(forTextStyle: .headline)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)
        
        content.axis = .vertical
        content.spacing = 10
        content.isLayoutMarginsRelativeArrangement = true
        content.layoutMargins = UIEdgeInsets(top: 10, left: 15, bottom: 10, right: 15)
        content.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(content)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 15),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 15),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -15),
            
            content.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 10),
            content.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            content.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            content.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -15)
        ])
        
        return containerView
    }
    
    private func setupGeneralSettings() {
        // Protection Toggle
        let protectionRow = createSettingRow(title: "Enable Protection", control: protectionToggle)
        protectionToggle.addTarget(self, action: #selector(protectionToggleChanged), for: .valueChanged)
        generalSettingsSection.addArrangedSubview(protectionRow)
        
        // Sensitivity Slider
        sensitivitySlider.minimumValue = 0
        sensitivitySlider.maximumValue = 2
        sensitivitySlider.value = 1 // Medium
        sensitivitySlider.isContinuous = false
        sensitivitySlider.addTarget(self, action: #selector(sensitivitySliderChanged), for: .valueChanged)
        
        sensitivityLabel.text = "Sensitivity: Medium"
        sensitivityLabel.font = UIFont.preferredFont(forTextStyle: .subheadline)
        sensitivityLabel.textColor = .secondaryLabel
        
        let sliderStack = UIStackView(arrangedSubviews: [sensitivitySlider, sensitivityLabel])
        sliderStack.axis = .vertical
        sliderStack.spacing = 5
        
        let sensitivityRow = createSettingRow(title: "Security Robustness", control: sliderStack)
        generalSettingsSection.addArrangedSubview(sensitivityRow)
    }
    
    private func setupTelemetrySettings() {
        // Telemetry Toggle
        let telemetryRow = createSettingRow(title: "Enable Anonymized Telemetry", control: telemetryToggle)
        telemetryToggle.addTarget(self, action: #selector(telemetryToggleChanged), for: .valueChanged)
        telemetrySettingsSection.addArrangedSubview(telemetryRow)
        
        // Anonymization Level
        anonymizationLevelSegmentedControl.selectedSegmentIndex = 1 // Medium
        anonymizationLevelSegmentedControl.addTarget(self, action: #selector(anonymizationLevelChanged), for: .valueChanged)
        
        let anonymizationRow = createSettingRow(title: "Anonymization Level", control: anonymizationLevelSegmentedControl)
        telemetrySettingsSection.addArrangedSubview(anonymizationRow)
    }
    
    private func setupAdvancedSettings() {
        // Verbose Logging Toggle
        let verboseLoggingRow = createSettingRow(title: "Verbose Logging", control: verboseLoggingToggle)
        verboseLoggingToggle.addTarget(self, action: #selector(verboseLoggingToggleChanged), for: .valueChanged)
        advancedSettingsSection.addArrangedSubview(verboseLoggingRow)
        
        // Logs Viewer Button
        logsViewerButton.setTitle("View Logs", for: .normal)
        logsViewerButton.addTarget(self, action: #selector(viewLogs), for: .touchUpInside)
        styleButton(logsViewerButton)
        advancedSettingsSection.addArrangedSubview(logsViewerButton)
        
        // Export Logs Button
        exportLogsButton.setTitle("Export Logs", for: .normal)
        exportLogsButton.addTarget(self, action: #selector(exportLogs), for: .touchUpInside)
        styleButton(exportLogsButton)
        advancedSettingsSection.addArrangedSubview(exportLogsButton)
    }
    
    private func setupPiiRemovalSection() {
        piiRemovalStatusLabel.text = "Status: Not enrolled"
        piiRemovalStatusLabel.font = UIFont.preferredFont(forTextStyle: .body)
        piiRemovalStatusLabel.textColor = .secondaryLabel
        piiRemovalSection.addArrangedSubview(piiRemovalStatusLabel)
        
        managePiiButton.setTitle("Manage PII Removal", for: .normal)
        managePiiButton.addTarget(self, action: #selector(managePiiRemoval), for: .touchUpInside)
        styleButton(managePiiButton)
        piiRemovalSection.addArrangedSubview(managePiiButton)
    }
    
    private func setupSubscriptionSection() {
        subscriptionStatusLabel.text = "Status: Free Trial (3 days left)"
        subscriptionStatusLabel.font = UIFont.preferredFont(forTextStyle: .body)
        subscriptionStatusLabel.textColor = .secondaryLabel
        subscriptionSection.addArrangedSubview(subscriptionStatusLabel)
        
        manageSubscriptionButton.setTitle("Manage Subscription", for: .normal)
        manageSubscriptionButton.addTarget(self, action: #selector(manageSubscription), for: .touchUpInside)
        styleButton(manageSubscriptionButton)
        subscriptionSection.addArrangedSubview(manageSubscriptionButton)
    }
    
    private func createSettingRow(title: String, control: UIView) -> UIView {
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.alignment = .center
        stack.distribution = .equalSpacing
        
        let label = UILabel()
        label.text = title
        label.font = UIFont.preferredFont(forTextStyle: .body)
        stack.addArrangedSubview(label)
        stack.addArrangedSubview(control)
        
        return stack
    }
    
    private func styleButton(_ button: UIButton) {
        button.backgroundColor = .systemBlue
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 8
        button.contentEdgeInsets = UIEdgeInsets(top: 10, left: 15, bottom: 10, right: 15)
    }
    
    private func loadSettings() {
        protectionToggle.isOn = securityManager.isProtectionEnabled()
        
        let sensitivity = settingsManager.getSetting(key: "sensitivityLevel") as? String ?? "medium"
        switch sensitivity {
        case "low": sensitivitySlider.value = 0
        case "medium": sensitivitySlider.value = 1
        case "high": sensitivitySlider.value = 2
        default: sensitivitySlider.value = 1
        }
        updateSensitivityLabel(value: sensitivitySlider.value)
        
        telemetryToggle.isOn = telemetryManager.getTelemetryStats().isEnabled
        if let anonymizationLevelString = settingsManager.getSetting(key: "anonymizationLevel") as? String,
           let index = AnonymizationLevel.allCases.firstIndex(where: { $0.rawValue == anonymizationLevelString }) {
            anonymizationLevelSegmentedControl.selectedSegmentIndex = index
        }
        
        verboseLoggingToggle.isOn = settingsManager.getSetting(key: "verboseLogging") as? Bool ?? false
        
        // Update PII and Subscription status (mocked for now)
        piiRemovalStatusLabel.text = "Status: Enrolled, 12 data brokers removed"
        subscriptionStatusLabel.text = "Status: Active, Annual Plan"
    }
    
    private func saveSettings() {
        settingsManager.updateSetting(key: "protectionEnabled", value: protectionToggle.isOn)
        securityManager.setProtectionEnabled(protectionToggle.isOn)
        
        let sensitivity: String
        switch sensitivitySlider.value {
        case 0: sensitivity = "low"
        case 1: sensitivity = "medium"
        case 2: sensitivity = "high"
        default: sensitivity = "medium"
        }
        settingsManager.updateSetting(key: "sensitivityLevel", value: sensitivity)
        
        telemetryManager.setTelemetryEnabled(telemetryToggle.isOn)
        let selectedAnonymizationLevel = AnonymizationLevel.allCases[anonymizationLevelSegmentedControl.selectedSegmentIndex]
        telemetryManager.setAnonymizationLevel(selectedAnonymizationLevel)
        settingsManager.updateSetting(key: "anonymizationLevel", value: selectedAnonymizationLevel.rawValue)
        
        settingsManager.updateSetting(key: "verboseLogging", value: verboseLoggingToggle.isOn)
        
        logger.info("Settings saved")
    }
    
    @objc private func doneButtonTapped() {
        saveSettings()
        dismiss(animated: true, completion: nil)
    }
    
    @objc private func protectionToggleChanged(_ sender: UISwitch) {
        saveSettings()
    }
    
    @objc private func sensitivitySliderChanged(_ sender: UISlider) {
        let roundedValue = round(sender.value)
        sender.value = roundedValue
        updateSensitivityLabel(value: roundedValue)
        saveSettings()
    }
    
    private func updateSensitivityLabel(value: Float) {
        switch value {
        case 0: sensitivityLabel.text = "Sensitivity: Low (Less Intrusive)"
        case 1: sensitivityLabel.text = "Sensitivity: Medium (Balanced)"
        case 2: sensitivityLabel.text = "Sensitivity: High (Most Robust)"
        default: sensitivityLabel.text = "Sensitivity: Medium (Balanced)"
        }
    }
    
    @objc private func telemetryToggleChanged(_ sender: UISwitch) {
        saveSettings()
    }
    
    @objc private func anonymizationLevelChanged(_ sender: UISegmentedControl) {
        saveSettings()
    }
    
    @objc private func verboseLoggingToggleChanged(_ sender: UISwitch) {
        saveSettings()
    }
    
    @objc private func viewLogs() {
        logger.info("Opening logs viewer...")
        // In a real app, navigate to a logs viewer screen
        let alert = UIAlertController(title: "Logs Viewer", message: "This feature is under development. Logs will be displayed here.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func exportLogs() {
        logger.info("Exporting logs...")
        // In a real app, gather logs and present a share sheet
        let alert = UIAlertController(title: "Export Logs", message: "This feature is under development. Logs will be exported.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func managePiiRemoval() {
        logger.info("Navigating to PII Removal management...")
        // In a real app, navigate to PII management screen or web view
        let alert = UIAlertController(title: "Manage PII Removal", message: "This feature is under development. You will be able to manage your PII removal settings here.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func manageSubscription() {
        logger.info("Navigating to Subscription management...")
        // In a real app, navigate to subscription management screen or web view
        let alert = UIAlertController(title: "Manage Subscription", message: "This feature is under development. You will be able to manage your subscription here.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - SettingsManager (Shared between app and extensions)

class SettingsManager {
    static let shared = SettingsManager()
    private let userDefaults = UserDefaults(suiteName: "group.com.zrodayresearchlabs")! // Use App Group for shared settings
    
    private init() {
        // Set default values if not already set
        if userDefaults.object(forKey: "protectionEnabled") == nil {
            userDefaults.set(true, forKey: "protectionEnabled")
        }
        if userDefaults.object(forKey: "sensitivityLevel") == nil {
            userDefaults.set("medium", forKey: "sensitivityLevel")
        }
        if userDefaults.object(forKey: "telemetryEnabled") == nil {
            userDefaults.set(true, forKey: "telemetryEnabled")
        }
        if userDefaults.object(forKey: "anonymizationLevel") == nil {
            userDefaults.set(AnonymizationLevel.medium.rawValue, forKey: "anonymizationLevel")
        }
        if userDefaults.object(forKey: "verboseLogging") == nil {
            userDefaults.set(false, forKey: "verboseLogging")
        }
    }
    
    func getSetting(key: String) -> Any? {
        return userDefaults.object(forKey: key)
    }
    
    func updateSetting(key: String, value: Any) {
        userDefaults.set(value, forKey: key)
        // Post notification for settings changes if needed
        NotificationCenter.default.post(name: .zroDaySettingsChanged, object: nil, userInfo: [key: value])
    }
}

extension Notification.Name {
    static let zroDaySettingsChanged = Notification.Name("zroDaySettingsChanged")
}
