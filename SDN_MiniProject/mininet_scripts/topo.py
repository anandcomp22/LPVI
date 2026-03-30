from mininet.topo import Topo
from mininet.net import Mininet
from mininet.node import RemoteController, OVSKernelSwitch
from mininet.cli import CLI
from mininet.log import setLogLevel

class SmartRoutingTopo(Topo):
    def build(self):
        # Create 8 Switches
        s1 = self.addSwitch('s1', cls=OVSKernelSwitch)
        s2 = self.addSwitch('s2', cls=OVSKernelSwitch)
        s3 = self.addSwitch('s3', cls=OVSKernelSwitch)
        s4 = self.addSwitch('s4', cls=OVSKernelSwitch)
        s5 = self.addSwitch('s5', cls=OVSKernelSwitch)
        s6 = self.addSwitch('s6', cls=OVSKernelSwitch)
        s7 = self.addSwitch('s7', cls=OVSKernelSwitch)
        s8 = self.addSwitch('s8', cls=OVSKernelSwitch)

        # Create Hosts
        h1 = self.addHost('h1', ip='10.0.0.1')
        h2 = self.addHost('h2', ip='10.0.0.2')

        # Connect Hosts to edge switches
        self.addLink(h1, s1)
        self.addLink(h2, s8)

        # Create Core Mesh Topo (Redundant paths)
        # Path A (Upper)
        self.addLink(s1, s2)
        self.addLink(s2, s5)
        self.addLink(s5, s8)
        
        # Path B (Middle)
        self.addLink(s1, s3)
        self.addLink(s3, s6)
        self.addLink(s6, s8)
        
        # Path C (Lower)
        self.addLink(s1, s4)
        self.addLink(s4, s7)
        self.addLink(s7, s8)
        
        # Cross Links for dynamic rerouting
        self.addLink(s2, s6)
        self.addLink(s3, s7)

def run():
    topo = SmartRoutingTopo()
    net = Mininet(topo=topo, controller=lambda name: RemoteController(name, ip='127.0.0.1', port=6653))
    
    net.start()
    print("Network initialized. Core nodes established.")
    print("Execute 'pingall' to populate mac tables.")
    CLI(net)
    net.stop()

if __name__ == '__main__':
    setLogLevel('info')
    run()
