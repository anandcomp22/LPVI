const moment = require('moment');

class SDNTrafficSimulator {
  constructor() {
    this.nodes = 8;
    this.links = 14;
    this.timeSeries = [];
    this.activeAlerts = [];
    this.controllerLogs = [];
    this.currentPath = 'Path A (1 -> 5 -> 8)';
    
    // Initialize exactly 24 time points for the current day
    let start = moment().subtract(24, 'minutes');
    for (let i = 0; i < 24; i++) {
        this.timeSeries.push({
            time: start.add(1, 'minute').format('HH:mm'),
            latency: Math.floor(Math.random() * 20) + 10,
            packetLoss: Math.random() * 2,
            bandwidth: Math.floor(Math.random() * 70) + 10
        });
    }

    this.addLog('INFO: Nexus Controller started successfully.');
    this.addLog('INFO: Topology discovered (8 Switches, 14 Links).');
  }

  addLog(msg) {
    const timestamp = moment().format('HH:mm:ss');
    this.controllerLogs.unshift(`[${timestamp}] ${msg}`);
    if (this.controllerLogs.length > 50) this.controllerLogs.pop();
  }

  updateMetrics() {
    // Determine path shifts based on random spikes
    let spike = Math.random() > 0.8;
    let newBandwidth = spike ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 20;
    
    if (newBandwidth > 85 && this.currentPath === 'Path A (1 -> 5 -> 8)') {
         this.addLog('WARNING: Congestion detected on Link s1-s5 (Load > 85%).');
         this.addLog('ACTION: Rerouting flows via s4.');
         this.currentPath = 'Path B (1 -> 4 -> 8)';
         newBandwidth = Math.floor(Math.random() * 40) + 20; // drop load
    } else if (Math.random() > 0.95 && this.currentPath === 'Path B (1 -> 4 -> 8)') {
         this.addLog('INFO: Path A optimal. Reverting traffic.');
         this.currentPath = 'Path A (1 -> 5 -> 8)';
    }

    // append new data
    this.timeSeries.push({
        time: moment().format('HH:mm'),
        latency: this.currentPath === 'Path B (1 -> 4 -> 8)' ? Math.floor(Math.random() * 10) + 25 : Math.floor(Math.random() * 20) + 10,
        packetLoss: spike ? Math.random() * 5 : Math.random() * 1.5,
        bandwidth: newBandwidth
    });
    
    if (this.timeSeries.length > 24) this.timeSeries.shift();
  }

  getMetrics() {
    this.updateMetrics(); // update state every poll
    
    return {
       topology: {
           switches: this.nodes,
           hosts: 16,
           activeLinks: this.links,
       },
       status: {
           activePath: this.currentPath,
           overallLoad: `${Math.floor(this.timeSeries[this.timeSeries.length-1].bandwidth)}%`,
           controllerState: 'ACTIVE & DYNAMIC'
       },
       charts: {
           timeSeries: this.timeSeries
       },
       logs: this.controllerLogs,
       flowTables: [
           { switch: 's1', tableId: 0, priority: 100, match: 'in_port=1,eth_type=0x0800', action: 'output:2', packets: Math.floor(Math.random() * 50000) + 1000 },
           { switch: 's1', tableId: 0, priority: 100, match: 'in_port=2,eth_type=0x0800', action: 'output:1', packets: Math.floor(Math.random() * 50000) + 1000 },
           { switch: 's4', tableId: 0, priority: 50, match: 'eth_type=0x0806', action: 'FLOOD', packets: Math.floor(Math.random() * 2000) + 100 },
           { switch: 's5', tableId: 0, priority: 100, match: 'in_port=1,eth_type=0x0800,nw_dst=10.0.0.16', action: 'output:3', packets: Math.floor(Math.random() * 10000) + 500 },
           { switch: 's8', tableId: 0, priority: 100, match: 'in_port=2,eth_type=0x0800,nw_dst=10.0.0.1', action: 'output:1', packets: Math.floor(Math.random() * 10000) + 500 }
       ]
    };
  }
}

module.exports = new SDNTrafficSimulator();
