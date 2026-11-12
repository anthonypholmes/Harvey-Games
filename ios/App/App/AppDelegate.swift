import UIKit
import AVFoundation
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Bonnie's voice: tell iOS this app plays sound, so the web view's audio is heard
        // and the iPad's silent switch or Control Centre mute doesn't silence her.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// MARK: - The full game (in-app purchase)
//
// The free app has a taster. One purchase (below) opens every world. This is the App Store side;
// the game side is "THE FULL GAME" in js/meadow-core.js. It uses Apple's StoreKit directly, so
// nothing about the family is sent to anyone but Apple.

import StoreKit

/// The app's screen: the usual Capacitor web view, plus the MeadowStore plugin.
class MeadowViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(MeadowStorePlugin())
        // Feel like an app, not a web page: no rubber-band bounce at the top and bottom, and no pinch zoom.
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
        webView?.scrollView.pinchGestureRecognizer?.isEnabled = false
    }
}

@objc(MeadowStorePlugin)
public class MeadowStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MeadowStorePlugin"
    public let jsName = "MeadowStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "buy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]

    /// The product's ID. It must match the one made in App Store Connect (and in Meadow.storekit).
    static let productId = "uk.co.holmeshouse.meadow.fullgame"

    private var updates: Task<Void, Never>?

    /// Purchases that finish later (Ask to Buy approved, a refund, another device) arrive here.
    override public func load() {
        updates = Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result { await transaction.finish() }
                guard let self = self else { return }
                self.notifyListeners("changed", data: ["owned": await self.owned()])
            }
        }
    }

    deinit { updates?.cancel() }

    private func owned() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == Self.productId,
               transaction.revocationDate == nil {
                return true
            }
        }
        return false
    }

    private func product() async -> Product? {
        return try? await Product.products(for: [Self.productId]).first
    }

    @objc func status(_ call: CAPPluginCall) {
        Task {
            let item = await product()
            call.resolve(["owned": await owned(), "available": item != nil, "price": item?.displayPrice ?? ""])
        }
    }

    @objc func buy(_ call: CAPPluginCall) {
        Task {
            guard let item = await product() else { call.reject("The App Store can't be reached"); return }
            do {
                switch try await item.purchase() {
                case .success(let result):
                    if case .verified(let transaction) = result { await transaction.finish() }
                    call.resolve(["owned": await owned()])
                case .pending:
                    call.resolve(["owned": false, "pending": true])
                case .userCancelled:
                    call.resolve(["owned": await owned(), "cancelled": true])
                @unknown default:
                    call.resolve(["owned": await owned()])
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                call.resolve(["owned": await owned()])
            } catch StoreKitError.userCancelled {
                call.resolve(["owned": await owned(), "cancelled": true])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }
}
