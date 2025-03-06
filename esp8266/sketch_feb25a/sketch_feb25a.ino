// Librerias
#include "ESP8266WiFi.h"
#include "DHT.h"

#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// Definiciones
#define DHTPIN 14  // GPIO14 en ESP8266MOD D5
#define DHTTYPE DHT22
#define MQ A0
#define TRIG_PIN 0  // GPIO0 (D3 en NodeMCU)
#define ECHO_PIN 2  // GPIO2 (D4 en NodeMCU)

// Iniciar Sensor
DHT dht(DHTPIN, DHTTYPE);

// WiFi
const char* ssid = "LS18";
const char* password = "123456789";

// Port
#define LISTEN_PORT 80

// Crear instancia del servidor
WiFiServer server(LISTEN_PORT);

// Variables API
float mq, humedad, temperatura, distancia;

void setup() {
  Serial.begin(9600);
  dht.begin();

  // Configurar pines del HC-SR04
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);


  // Conexion WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi conectado");

  // Iniciar Servidor
  server.begin();
  Serial.println("Servidor Inicializado");

  // IP
  Serial.println(WiFi.localIP());
}

void loop() {
  delay(6000);
  mq = analogRead(MQ); // MQ135
  humedad = dht.readHumidity(); // RH 0% - 100%
  temperatura = dht.readTemperature(); // 0 - 100 *C
  distancia = medirDistancia(); // Medir distancia con HC-SR04

  // Mostrar datos en el monitor serial para depuración
  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.print(" °C, Humedad: ");
  Serial.print(humedad);
  Serial.print(" %, Contaminación: ");
  Serial.print(mq);
  Serial.print(", Distancia: ");
  Serial.print(distancia);
  Serial.println(" cm");

  // Llamado a la REST
  WiFiClient client = server.available();
  if (!client) {
    return;
  }
  while (!client.available()) {
    delay(1);
  }

  // Leer la solicitud del cliente
  String request = client.readStringUntil('\r');
  client.flush();

  // Servir la página HTML
  if (request.indexOf("GET / ") != -1) {
    String html = "<!DOCTYPE html><html><head><title>Datos del Sensor</title>";
    html += "<meta charset='UTF-8'>"; 
    html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
    html += "<style>";
    html += "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f5f7fa, #c3cfe2); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }";
    html += ".container { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); text-align: center; }";
    html += "h1 { color: #333; margin-bottom: 1.5rem; }";
    html += ".data { font-size: 1.5rem; margin: 1rem 0; color: #555; }";
    html += ".data span { font-weight: bold; color: #007bff; }";
    html += "</style>";
    html += "<script>";
    html += "function updateData() {";
    html += "  fetch('/data')";
    html += "    .then(response => response.json())";
    html += "    .then(data => {";
    html += "      document.getElementById('temperatura').innerText = data.temperatura.toFixed(2) + ' °C';";
    html += "      document.getElementById('humedad').innerText = data.humedad.toFixed(2) + ' %';";
    html += "      document.getElementById('contaminacion').innerText = data.contaminacion;";
    html += "      document.getElementById('distancia').innerText = data.distancia.toFixed(2) + ' cm';";
    html += "    });";
    html += "}";
    html += "setInterval(updateData, 1000);"; // Actualiza cada segundo
    html += "</script>";
    html += "</head><body>";
    html += "<div class='container'>";
    html += "<h1>📊 Datos del Sensor</h1>";
    html += "<div class='data'><strong>🌡 Temperatura:</strong> <span id='temperatura'>--</span></div>";
    html += "<div class='data'><strong>💧 Humedad:</strong> <span id='humedad'>--</span></div>";
    html += "<div class='data'><strong>☁ Contaminación:</strong> <span id='contaminacion'>--</span></div>";
    html += "<div class='data'><strong>📏 Distancia:</strong> <span id='distancia'>--</span></div>";
    html += "</div>";
    html += "</body></html>";

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html; charset=UTF-8"); 
    client.println("Connection: close");
    client.println();
    client.println(html);
  }
  // Servir los datos en formato JSON
  else if (request.indexOf("GET /data ") != -1) {
    String json = "{";
    json += "\"temperatura\": " + String(temperatura) + ",";
    json += "\"humedad\": " + String(humedad) + ",";
    json += "\"contaminacion\": " + String(mq) + ",";
    json += "\"distancia\": " + String(distancia);
    json += "}";

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();
    client.println(json);
  }

  Serial.print("Enviando datos... ");
  enviarDatos();  // Llamar a la función para enviar los datos
}

// Función para medir la distancia con el HC-SR04
float medirDistancia() {
  // Enviar un pulso de 10 microsegundos al pin Trig
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Medir el tiempo de respuesta del pin Echo
  long duracion = pulseIn(ECHO_PIN, HIGH);

  // Si no se recibe un eco válido, retornar 0
  if (duracion <= 0) {
    return 0;
  }

  // Calcular la distancia en centímetros
  float distancia = duracion * 0.034 / 2; // Velocidad del sonido: 0.034 cm/μs
  return distancia;
}

void enviarDatos() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Error: No hay conexión a WiFi");
    return;
  }

  WiFiClientSecure client;
  HTTPClient http;

  client.setInsecure();  // Deshabilita la verificación SSL (usar con precaución)
  http.begin(client, "url_api");

  http.addHeader("Content-Type", "application/json");
  // http.addHeader("x-api-key", "TU_CLAVE_API");  // Si la API requiere autenticación

  // Crear el JSON con los datos del sensor
  StaticJsonDocument<200> jsonDoc;
  jsonDoc["temperatura"] = temperatura;
  jsonDoc["humedad"] = humedad;
  jsonDoc["contaminacion"] = mq;
  jsonDoc["distancia"] = distancia;

  String jsonStr;
  serializeJson(jsonDoc, jsonStr);

  Serial.print("Enviando JSON: ");
  Serial.println(jsonStr);

  int httpResponseCode = http.POST(jsonStr);

  if (httpResponseCode > 0) {
    Serial.print("Respuesta de AWS: ");
    Serial.println(httpResponseCode);
    Serial.println(http.getString());
  } else {
    Serial.print("Error en la conexión: ");
    Serial.println(http.errorToString(httpResponseCode));
  }

  http.end();
}



