import UIKit

protocol SecureKeyboardViewDelegate: AnyObject {
    func keyboardView(_ keyboardView: SecureKeyboardView, didTapKey key: String)
    func keyboardView(_ keyboardView: SecureKeyboardView, didTapSpecialKey key: SpecialKey)
}

class SecureKeyboardView: UIView {
    
    weak var delegate: SecureKeyboardViewDelegate?
    
    // UI Components
    private var stackView: UIStackView!
    private var securityIndicator: UILabel!
    private var keyRows: [UIStackView] = []
    private var keyButtons: [UIButton] = []
    
    // State
    private var isShifted = false
    private var isNumbersMode = false
    private var isEnabled = true
    private var securityLevel: SecurityLevel = .high
    
    // Key layouts
    private let qwertyLayout = [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["shift", "z", "x", "c", "v", "b", "n", "m", "delete"],
        ["numbers", "space", "return", "security"]
    ]
    
    private let numbersLayout = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
        ["#+=", ".", ",", "?", "!", "'", "delete"],
        ["letters", "space", "return", "security"]
    ]
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }
    
    private func setupView() {
        backgroundColor = UIColor.systemBackground
        
        setupSecurityIndicator()
        setupKeyboard()
        applyZroDayTheme()
    }
    
    private func setupSecurityIndicator() {
        securityIndicator = UILabel()
        securityIndicator.text = "SECURE"
        securityIndicator.textAlignment = .center
        securityIndicator.font = UIFont.systemFont(ofSize: 12, weight: .bold)
        securityIndicator.textColor = .systemGreen
        securityIndicator.backgroundColor = UIColor.systemGreen.withAlphaComponent(0.1)
        securityIndicator.layer.cornerRadius = 8
        securityIndicator.layer.masksToBounds = true
        securityIndicator.translatesAutoresizingMaskIntoConstraints = false
        
        addSubview(securityIndicator)
        
        NSLayoutConstraint.activate([
            securityIndicator.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 8),
            securityIndicator.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            securityIndicator.widthAnchor.constraint(equalToConstant: 60),
            securityIndicator.heightAnchor.constraint(equalToConstant: 24)
        ])
    }
    
    private func setupKeyboard() {
        stackView = UIStackView()
        stackView.axis = .vertical
        stackView.distribution = .fillEqually
        stackView.spacing = 8
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: securityIndicator.bottomAnchor, constant: 16),
            stackView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 8),
            stackView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -8),
            stackView.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -8)
        ])
        
        createKeyRows()
    }
    
    private func createKeyRows() {
        // Clear existing rows
        keyRows.forEach { $0.removeFromSuperview() }
        keyRows.removeAll()
        keyButtons.removeAll()
        
        let layout = isNumbersMode ? numbersLayout : qwertyLayout
        
        for (rowIndex, row) in layout.enumerated() {
            let rowStackView = UIStackView()
            rowStackView.axis = .horizontal
            rowStackView.distribution = .fillEqually
            rowStackView.spacing = 4
            
            for key in row {
                let button = createKeyButton(for: key, rowIndex: rowIndex)
                rowStackView.addArrangedSubview(button)
                keyButtons.append(button)
            }
            
            stackView.addArrangedSubview(rowStackView)
            keyRows.append(rowStackView)
        }
    }
    
    private func createKeyButton(for key: String, rowIndex: Int) -> UIButton {
        let button = UIButton(type: .system)
        
        // Configure button appearance
        button.backgroundColor = getKeyBackgroundColor(for: key)
        button.setTitleColor(getKeyTextColor(for: key), for: .normal)
        button.layer.cornerRadius = 8
        button.layer.shadowColor = UIColor.black.cgColor
        button.layer.shadowOpacity = 0.1
        button.layer.shadowOffset = CGSize(width: 0, height: 1)
        button.layer.shadowRadius = 2
        
        // Set title and font
        let displayText = getDisplayText(for: key)
        button.setTitle(displayText, for: .normal)
        button.titleLabel?.font = getKeyFont(for: key)
        
        // Add target
        button.addTarget(self, action: #selector(keyTapped(_:)), for: .touchUpInside)
        button.tag = keyButtons.count // Use tag to identify the key
        
        // Add haptic feedback
        button.addTarget(self, action: #selector(keyTouchDown(_:)), for: .touchDown)
        
        // Adjust width for special keys
        if isSpecialKey(key) {
            button.widthAnchor.constraint(greaterThanOrEqualToConstant: getSpecialKeyWidth(for: key)).isActive = true
        }
        
        return button
    }
    
    private func getDisplayText(for key: String) -> String {
        switch key {
        case "shift":
            return isShifted ? "⇧" : "⇧"
        case "delete":
            return "⌫"
        case "space":
            return "space"
        case "return":
            return "return"
        case "numbers":
            return "123"
        case "letters":
            return "ABC"
        case "#+=":
            return "#+="
        case "security":
            return "🔒"
        default:
            return isShifted && !isNumbersMode ? key.uppercased() : key
        }
    }
    
    private func getKeyBackgroundColor(for key: String) -> UIColor {
        switch key {
        case "shift", "delete", "numbers", "letters", "#+=":
            return UIColor.systemGray4
        case "space":
            return UIColor.systemGray5
        case "return":
            return UIColor.systemBlue
        case "security":
            return securityLevel == .maximum ? UIColor.systemRed : UIColor.systemGreen
        default:
            return UIColor.systemBackground
        }
    }
    
    private func getKeyTextColor(for key: String) -> UIColor {
        switch key {
        case "return":
            return UIColor.white
        case "security":
            return UIColor.white
        default:
            return UIColor.label
        }
    }
    
    private func getKeyFont(for key: String) -> UIFont {
        switch key {
        case "shift", "delete", "numbers", "letters", "#+=":
            return UIFont.systemFont(ofSize: 14, weight: .medium)
        case "space", "return":
            return UIFont.systemFont(ofSize: 16, weight: .medium)
        case "security":
            return UIFont.systemFont(ofSize: 18)
        default:
            return UIFont.systemFont(ofSize: 20, weight: .regular)
        }
    }
    
    private func isSpecialKey(_ key: String) -> Bool {
        return ["shift", "delete", "space", "return", "numbers", "letters", "#+=", "security"].contains(key)
    }
    
    private func getSpecialKeyWidth(for key: String) -> CGFloat {
        switch key {
        case "space":
            return 150
        case "shift", "delete":
            return 60
        default:
            return 50
        }
    }
    
    @objc private func keyTouchDown(_ sender: UIButton) {
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
        
        // Visual feedback
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform(scaleX: 0.95, y: 0.95)
        }
    }
    
    @objc private func keyTapped(_ sender: UIButton) {
        guard isEnabled else { return }
        
        // Reset visual feedback
        UIView.animate(withDuration: 0.1) {
            sender.transform = CGAffineTransform.identity
        }
        
        let layout = isNumbersMode ? numbersLayout : qwertyLayout
        var key = ""
        
        // Find the key based on button tag
        var currentIndex = 0
        for row in layout {
            for rowKey in row {
                if currentIndex == sender.tag {
                    key = rowKey
                    break
                }
                currentIndex += 1
            }
            if !key.isEmpty { break }
        }
        
        // Handle key press
        if isSpecialKey(key) {
            handleSpecialKey(key)
        } else {
            let finalKey = isShifted && !isNumbersMode ? key.uppercased() : key
            delegate?.keyboardView(self, didTapKey: finalKey)
            
            // Auto-disable shift after character input
            if isShifted {
                toggleShift()
            }
        }
    }
    
    private func handleSpecialKey(_ key: String) {
        switch key {
        case "shift":
            delegate?.keyboardView(self, didTapSpecialKey: .shift)
        case "delete":
            delegate?.keyboardView(self, didTapSpecialKey: .delete)
        case "space":
            delegate?.keyboardView(self, didTapSpecialKey: .space)
        case "return":
            delegate?.keyboardView(self, didTapSpecialKey: .return)
        case "numbers", "#+=":
            delegate?.keyboardView(self, didTapSpecialKey: .numbers)
        case "letters":
            delegate?.keyboardView(self, didTapSpecialKey: .letters)
        case "security":
            delegate?.keyboardView(self, didTapSpecialKey: .securityToggle)
        default:
            break
        }
    }
    
    // MARK: - Public Methods
    
    func toggleShift() {
        isShifted.toggle()
        updateKeyTitles()
    }
    
    func switchToNumbers() {
        isNumbersMode = true
        createKeyRows()
    }
    
    func switchToLetters() {
        isNumbersMode = false
        createKeyRows()
    }
    
    func setSecureMode(_ secure: Bool) {
        // Update visual indicators for secure mode
        let alpha: CGFloat = secure ? 1.0 : 0.6
        UIView.animate(withDuration: 0.3) {
            self.alpha = alpha
        }
    }
    
    func setEnabled(_ enabled: Bool) {
        isEnabled = enabled
        
        UIView.animate(withDuration: 0.3) {
            self.alpha = enabled ? 1.0 : 0.3
        }
        
        keyButtons.forEach { $0.isEnabled = enabled }
    }
    
    func updateSecurityLevel(_ level: SecurityLevel) {
        securityLevel = level
        updateSecurityIndicator()
        updateKeyColors()
    }
    
    func setSecurityIndicator(color: UIColor, text: String) {
        securityIndicator.textColor = color
        securityIndicator.backgroundColor = color.withAlphaComponent(0.1)
        securityIndicator.text = text
    }
    
    func applyZroDayTheme() {
        // Apply Zro-Day Research Labs branding
        backgroundColor = UIColor.systemBackground
        
        // Add subtle gradient background
        let gradientLayer = CAGradientLayer()
        gradientLayer.colors = [
            UIColor.systemBackground.cgColor,
            UIColor.systemGray6.cgColor
        ]
        gradientLayer.locations = [0.0, 1.0]
        gradientLayer.frame = bounds
        layer.insertSublayer(gradientLayer, at: 0)
        
        // Add border
        layer.borderWidth = 1
        layer.borderColor = UIColor.systemGray4.cgColor
    }
    
    private func updateKeyTitles() {
        for (index, button) in keyButtons.enumerated() {
            let layout = isNumbersMode ? numbersLayout : qwertyLayout
            var key = ""
            
            var currentIndex = 0
            for row in layout {
                for rowKey in row {
                    if currentIndex == index {
                        key = rowKey
                        break
                    }
                    currentIndex += 1
                }
                if !key.isEmpty { break }
            }
            
            let displayText = getDisplayText(for: key)
            button.setTitle(displayText, for: .normal)
        }
    }
    
    private func updateSecurityIndicator() {
        switch securityLevel {
        case .maximum:
            setSecurityIndicator(color: .systemRed, text: "MAX")
        case .high:
            setSecurityIndicator(color: .systemOrange, text: "HIGH")
        case .standard:
            setSecurityIndicator(color: .systemGreen, text: "STD")
        }
    }
    
    private func updateKeyColors() {
        for (index, button) in keyButtons.enumerated() {
            let layout = isNumbersMode ? numbersLayout : qwertyLayout
            var key = ""
            
            var currentIndex = 0
            for row in layout {
                for rowKey in row {
                    if currentIndex == index {
                        key = rowKey
                        break
                    }
                    currentIndex += 1
                }
                if !key.isEmpty { break }
            }
            
            button.backgroundColor = getKeyBackgroundColor(for: key)
            button.setTitleColor(getKeyTextColor(for: key), for: .normal)
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        // Update gradient layer frame
        if let gradientLayer = layer.sublayers?.first as? CAGradientLayer {
            gradientLayer.frame = bounds
        }
    }
}
