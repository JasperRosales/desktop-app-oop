package com.agritourism.frontend;

import com.agritourism.db.DatabaseConnection;
import com.agritourism.dao.FarmDAO;
import com.agritourism.model.FarmTour;
import com.agritourism.server.AgriTourismServer;
import javafx.application.Application;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * AgriTourism Desktop Application (JavaFX Host + Embedded Java Backend)
 * Starts the Java Backend Server (port 8080) and opens the HTML/CSS/TypeScript
 * UI inside a native JavaFX desktop window with JS-to-Java bridge.
 */
public class AgriTourismDesktopApp extends Application {

    private static final String JAVA_BACKEND_UI_URL = "http://localhost:" + AgriTourismServer.PORT;
    private static final String VITE_DEV_URL = "http://localhost:3000";

    @Override
    public void start(Stage primaryStage) {
        // Start embedded Java Backend Server on port 8080
        try {
            AgriTourismServer.startServer(AgriTourismServer.PORT);
        } catch (Exception e) {
            System.out.println("[AgriTourism JavaFX] Java Backend note: " + e.getMessage());
        }

        primaryStage.setTitle("AgriTourism Philippines");

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();
        webEngine.setJavaScriptEnabled(true);

        webEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");
                window.setMember("javaBridge", new JavaFrontendBridge(primaryStage));
                System.out.println("[AgriTourism JavaFX] Java-to-JavaScript bridge mounted.");
            }
        });

        boolean hasDistBundle = Files.exists(Paths.get("dist", "index.html"))
                || Files.exists(Paths.get("..", "dist", "index.html"));

        webEngine.load(hasDistBundle ? JAVA_BACKEND_UI_URL : VITE_DEV_URL);

        BorderPane root = new BorderPane(webView);
        Scene scene = new Scene(root, 1440, 900);

        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static class JavaFrontendBridge {
        private final Stage stage;
        private final FarmDAO farmDAO = new FarmDAO();

        public JavaFrontendBridge(Stage stage) {
            this.stage = stage;
        }

        public String testDatabaseConnection() {
            boolean connected = DatabaseConnection.testConnection();
            return connected ? "SUCCESS: Connected via JDBC to SQL Database!" : "INFO: JDBC not configured yet (running Java in-memory mode).";
        }

        public int getJdbcFarmCount() {
            List<FarmTour> farms = farmDAO.getAllFarms();
            return farms.size();
        }

        public void showNativeJavaDialog(String title, String message) {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle(title);
            alert.setHeaderText("AgriTourism Philippines");
            alert.setContentText(message);
            alert.showAndWait();
        }

        public void closeDesktopApp() {
            stage.close();
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
