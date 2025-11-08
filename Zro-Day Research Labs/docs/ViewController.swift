import UIKit
import SafariServices

class ViewController: UIViewController {
    
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var enableExtensionButton: UIButton!
    @IBOutlet weak var enableKeyboardButton: UIButton!
    @IBOutlet weak var securityStatusView: UIView!
    @IBOutlet weak var threatCountLabel: UILabel!
    @IBOutlet weak var lastScanLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        updateSecurityStatus()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        checkExtensionStatus()
    }
    
    private func setupUI() {
        // Apply Zro-Day Research Labs branding
        view.backgroundColor = UIColor.systemBackground
        
        // Setup security status view with rounded corners and shadow
        securityStatusView.layer.cornerRadius = 12
        securityStatusView.layer.shadowColor = UIColor.black.cgColor
        securityStatusView.layer.shadowOpacity = 0.1
        securityStatusView.layer.shadowOffset = CGSize(width: 0, height: 2)
        securityStatusView.layer.shadowRadius = 4
        
        // Style buttons
        styleButton(enableExtensionButton, title: "Enable Browser Watchdog")
        styleButton(enableKeyboardButton, title: "Enable Secure-Route™ Keyboard")
        
        // Setup navigation
        navigationItem.title = "Zro-Day Research Labs"
        navigationController?.navigationBar.prefersLargeTitles = true
        
        // Add settings button
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "gear"),
            style: .plain,
            target: self,
            action: #selector(openSettings)
        )
    }
    
    private func styleButton(_ button: UIButton, title: String) {
        button.setTitle(title, for: .normal)
        button.backgroundColor = UIColor.systemBlue
        button.setTitleColor(.white, for: .normal)
        button.layer.cornerRadius = 8
        button.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .medium)
    }
    
    private func checkExtensionStatus() {
        // Check Safari extension status
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: "com.zrodayresearchlabs.browserwatchdog") { (state, error) in
            DispatchQueue.main.async {
                if let state = state {
                    self.updateExtensionStatus(enabled: state.isEnabled)
                }
            }
        }
    }
    
    private func updateExtensionStatus(enabled: Bool) {
        if enabled {
            statusLabel.text = "Browser Watchdog: Active"
            statusLabel.textColor = .systemGreen
            enableExtensionButton.setTitle("Configure Extension", for: .normal)
        } else {
            statusLabel.text = "Browser Watchdog: Inactive"
            statusLabel.textColor = .systemRed
            enableExtensionButton.setTitle("Enable Browser Watchdog", for: .normal)
        }
    }
    
    private func updateSecurityStatus() {
        // Update threat count and last scan time
        let threatCount = SecurityManager.shared.getThreatCount()
        let lastScan = SecurityManager.shared.getLastScanTime()
        
        threatCountLabel.text = "Threats Blocked: \(threatCount)"
        
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        lastScanLabel.text = "Last Scan: \(formatter.string(from: lastScan))"
    }
    
    @IBAction func enableExtensionTapped(_ sender: UIButton) {
        // Open Safari extension preferences
        guard let url = URL(string: "App-prefs:SAFARI&path=WEB_EXTENSIONS") else { return }
        
        if UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        } else {
            // Fallback: Show instructions
            showExtensionInstructions()
        }
    }
    
    @IBAction func enableKeyboardTapped(_ sender: UIButton) {
        // Open keyboard settings
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
        
        // Show instructions
        showKeyboardInstructions()
    }
    
    private func showExtensionInstructions() {
        let alert = UIAlertController(
            title: "Enable Browser Watchdog",
            message: "To enable the Browser Watchdog:\n\n1. Open Safari\n2. Go to Settings > Extensions\n3. Enable 'Zro-Day Browser Watchdog'\n4. Grant necessary permissions",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showKeyboardInstructions() {
        let alert = UIAlertController(
            title: "Enable Secure-Route™ Keyboard",
            message: "To enable the Secure-Route™ Keyboard:\n\n1. Go to Settings > General > Keyboard > Keyboards\n2. Tap 'Add New Keyboard'\n3. Select 'Secure-Route™'\n4. Enable 'Allow Full Access' for enhanced security features",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    @objc private func openSettings() {
        let settingsVC = SettingsViewController()
        let navController = UINavigationController(rootViewController: settingsVC)
        present(navController, animated: true)
    }
}
