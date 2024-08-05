import json
import time
import socket
import requests
from scapy.all import sniff, Raw, IP, TCP
from pymongo import MongoClient
from flask import Flask, jsonify
from flask_cors import CORS
from urllib.parse import quote_plus

username = "adnankstheredteamlabs"
password = "Adnan@66202"
cluster_name = "cluster0"
database_name = "network_packets"

username_encoded = quote_plus(username)
password_encoded = quote_plus(password)

MONGO_URI = f"mongodb+srv://{username_encoded}:{password_encoded}@{cluster_name}.qrppz7h.mongodb.net/{database_name}?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client[database_name]
packets_collection = db['packets']
http_collection = db['http_packets']
system_info_collection = db['system_info']

def ensure_collections():
    if 'packets' not in db.list_collection_names():
        db.create_collection('packets')
    if 'http_packets' not in db.list_collection_names():
        db.create_collection('http_packets')
    if 'system_info' not in db.list_collection_names():
        db.create_collection('system_info')

ensure_collections()

app = Flask(__name__)
CORS(app)

def get_system_info():
    hostname = socket.gethostname()
    internal_ip = socket.gethostbyname(hostname)
    return {
        'hostname': hostname,
        'internal_ip': internal_ip
    }

def save_system_info():
    system_info = get_system_info()
    system_info_collection.delete_many({})
    system_info_collection.insert_one(system_info)

save_system_info()

def packet_callback(packet):
    if IP in packet:
        ip_layer = packet[IP]
        packet_info = {
            'timestamp': time.time(),
            'src_ip': ip_layer.src,
            'dst_ip': ip_layer.dst,
            'protocol': packet.proto,
            'length': len(packet),
            'raw_data': bytes(packet).hex()
        }
        
        if packet.haslayer(TCP):
            packet_info['src_port'] = packet[TCP].sport
            packet_info['dst_port'] = packet[TCP].dport
            packet_info['protocol_name'] = 'TCP'

            if packet.haslayer(Raw):
                payload = packet[Raw].load
                if b"POST" in payload:
                    http_info = {
                        'timestamp': time.time(),
                        'src_ip': ip_layer.src,
                        'dst_ip': ip_layer.dst,
                        'src_port': packet[TCP].sport,
                        'dst_port': packet[TCP].dport,
                        'method': 'POST',
                        'payload': payload.decode(errors='ignore')
                    }
                    http_collection.insert_one(http_info)
                    print(f"HTTP POST request captured and stored: {http_info}")

        packets_collection.insert_one(packet_info)
        print(f"Packet captured and stored: {packet_info}")

def start_sniffing():
    sniff(prn=packet_callback, store=0)

@app.route('/api/system_info', methods=['GET'])
def get_system_info_api():
    system_info = system_info_collection.find_one()
    if system_info:
        system_info['_id'] = str(system_info['_id'])
    return jsonify(system_info)

@app.route('/api/packets', methods=['GET'])
def get_packets():
    packets = list(packets_collection.find().sort("timestamp", -1).limit(100))
    for packet in packets:
        packet['_id'] = str(packet['_id'])
    return jsonify(packets)

@app.route('/api/http_packets', methods=['GET'])
def get_http_packets():
    http_packets = list(http_collection.find().sort("timestamp", -1).limit(100))
    for packet in http_packets:
        packet['_id'] = str(packet['_id'])
    return jsonify(http_packets)

@app.route('/api/top_ips', methods=['GET'])
def get_top_ips():
    pipeline = [
        {
            '$group': {
                '_id': '$src_ip',
                'count': {'$sum': 1}
            }
        },
        {
            '$sort': {'count': -1}
        },
        {
            '$limit': 10
        }
    ]
    top_ips = list(packets_collection.aggregate(pipeline))
    top_ips_info = []
    
    for ip in top_ips:
        # Get the IP address
        ip_address = ip['_id']
        # Get location information
        location_data = requests.get(f'http://ip-api.com/json/{ip_address}').json()
        top_ips_info.append({
            'ip': ip_address,
            'count': ip['count'],
            'city': location_data.get('city', 'N/A'),
            'region': location_data.get('regionName', 'N/A'),
            'country': location_data.get('country', 'N/A'),
            'isp': location_data.get('isp', 'N/A'),
        })
    
    return jsonify(top_ips_info)

@app.route('/api/stats', methods=['GET'])
def get_packet_stats():
    pipeline = [
        {
            '$group': {
                '_id': '$protocol_name',
                'count': {'$sum': 1}
            }
        }
    ]
    stats = list(packets_collection.aggregate(pipeline))
    return jsonify(stats)

if __name__ == "__main__":
    from multiprocessing import Process
    p = Process(target=start_sniffing)
    p.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
    p.join()
