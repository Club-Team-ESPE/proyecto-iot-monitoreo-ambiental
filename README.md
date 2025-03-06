# Monitoreo Ambiental con ESP8266  

Este proyecto utiliza un **ESP8266** para medir temperatura, humedad, calidad del aire y distancia, enviando los datos a una API y mostrando la información en una interfaz web.  

## 🚀 Características  

- **Sensores**:  
  - 🌡 **DHT22**: Temperatura y humedad.  
  - ☁ **MQ135**: Calidad del aire.  
  - 📏 **HC-SR04**: Medición de distancia.  
- **Conectividad**:  
  - 🌐 Servidor web embebido para visualización en tiempo real.  
  - 📡 Envío de datos a una API externa.  

## 📜 Requisitos  

- **Hardware**:  
  - ESP8266 (NodeMCU)  
  - Sensor DHT22  
  - Sensor MQ135  
  - Sensor HC-SR04  
- **Software**:  
  - Arduino IDE  
  - Librerías: `ESP8266WiFi`, `DHT`, `ESP8266HTTPClient`, `ArduinoJson`  

## 🔧 Configuración  

1. Instalar las librerías necesarias en el **Arduino IDE**.  
2. Conectar los sensores a los pines especificados en el código.  
3. Configurar las credenciales de WiFi en el código (`ssid` y `password`).  
4. Subir el código al ESP8266.  

## 📡 Uso  

- Accede a la dirección IP mostrada en el monitor serial para ver los datos en tiempo real.  
- Los datos también se pueden consumir en formato JSON a través del endpoint `/data`.  

## 📝 Código  

Consulta el archivo `main.ino` para más detalles sobre la implementación.  

## 📷 Interfaz Web  

1. Servidor integrado: El servidor integrado genera una interfaz visual amigable con actualizaciones automáticas. 
![Web integrada](https://github.com/Club-Team-ESPE/proyecto-iot-monitoreo-ambiental/docs/interfaz-web-esp8266.png)

2. Sitio web desplegable en la nube: Creado con ANGULAR JS, consiste en un cliente que consume los datos alojados en la nube y muestra las estadísticas.

![Web desplegable](https://github.com/Club-Team-ESPE/proyecto-iot-monitoreo-ambiental/docs/interfaz-web2.png)


