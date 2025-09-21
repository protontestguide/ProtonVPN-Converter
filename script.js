
document.getElementById('warpButton').onclick = function() {
    window.location.href = 'https://my-other-projects.vercel.app/';
}

document.getElementById('promoButton').onclick = function() {
    window.location.href = 'https://chatter-bike-3df.notion.site/Amnezia-Premium-1f72684dab0d8013a057ed6562c8bdca';
}

document.querySelectorAll('input[name="option"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const musor1 = document.querySelector('.musor1');
    const musor2 = document.querySelector('.musor2');
    const containerColumns = document.querySelector('.container-columns');
    const container2 = document.querySelector('.container2');
    
    if (this.id === 'karing') {
      musor1.classList.add('hidden');
      musor2.classList.remove('hidden');
      containerColumns.classList.add('karing-active');
      container2.classList.add('karing-active');
	  
    } else {
      musor1.classList.remove('hidden');
      musor2.classList.add('hidden');
      containerColumns.classList.remove('karing-active');
      container2.classList.remove('karing-active');
    }
  });
});
document.getElementById('wgFiles').addEventListener('change', function(e) {
    const files = e.target.files;
    const label = document.getElementById('fileUploadLabel');
    
    if (files.length === 0) {
        label.textContent = 'Выбрать файлы';
    } else {
        label.textContent = `Файлов выбрано: ${files.length}`;
    }
});
document.querySelector('.randombtn').onclick = function() {
  const jc = getRandomInt(1, 100);
  const jmin = getRandomInt(1, 200);
  const jmax = getRandomInt(jmin + 1, 201);
  
  document.getElementById('jc1').value = jc;
  document.getElementById('jmin1').value = jmin;
  document.getElementById('jmax1').value = jmax;
  document.getElementById('junk3').checked = true;
  convert()
};
document.querySelector('.randombtn2').onclick = function() {
  const generateRandomPair = () => {
    const first = getRandomInt(1, 50);
    const second = getRandomInt(first + 1, 120);
    return `${first}-${second}`;
  };
  document.getElementById('fp1').value = generateRandomPair();
  document.getElementById('fps1').value = generateRandomPair();
  document.getElementById('fpd1').value = generateRandomPair();
  document.getElementById('fake3').checked = true;
  convert()
};

const COUNTRY_FLAGS = {
      'JP': '🇯🇵 JP',
      'US': '🇺🇸 US',
      'NL': '🇳🇱 NL',
      'DE': '🇩🇪 DE',
      'FR': '🇫🇷 FR',
      'GB': '🇬🇧 GB',
      'CA': '🇨🇦 CA',
      'AU': '🇦🇺 AU',
      'RO': '🇷🇴 RO',
      'PL': '🇵🇱 PL'
    };
let proxyList = [];
function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

function generateAmneziaDefaults() {
  const selectedOption = document.querySelector('input[name="junk"]:checked').id;
  let jc, jmin, jmax;
  switch(selectedOption) {
    case 'junk1':
      jc = 3;
      jmin = 1;
      jmax = 3;
      break;
    case 'junk2':
      jc = 30;
      jmin = 10;
      jmax = 30;
      break;
    case 'junk3':
      jc = parseInt(document.getElementById('jc1').value) || 128;
      jmin = parseInt(document.getElementById('jmin1').value) || 1279;
      jmax = parseInt(document.getElementById('jmax1').value) || 1280;
      break;
    default:
      jc = 128;
      jmin = 1279;
      jmax = 1280;
  }

  if (jmax <= jmin) {
    jmax = jmin + 1;
  }

  return {
    jc: jc,
    jmin: jmin,
    jmax: jmax,
    s1: 0,
    s2: 0,
    h1: 1,
    h2: 2,
    h3: 3,
    h4: 4
  };
}

function parseWGConfig(text) {
  const config = { 
    interface: { amneziaOptions: {} },
    peers: []
  };
  let currentSection = null;

  text.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    if (currentSection === 'peer' && line.startsWith('#')) {
      const nameMatch = line.match(/#\s*(.+)/);
      if (nameMatch) {
        config.peers[config.peers.length - 1].name = nameMatch[1].trim();
      }
      return;
    }

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1).toLowerCase();
      if (currentSection === 'peer') config.peers.push({ amneziaOptions: {} });
      return;
    }

    const [key, ...valueParts] = line.split('=');
    const cleanKey = key.trim().toLowerCase();
    const value = valueParts.join('=').trim();

    if (currentSection === 'interface') {
      if (['jc', 'jmin', 'jmax', 's1', 's2', 'h1', 'h2', 'h3', 'h4'].includes(cleanKey)) {
        config.interface.amneziaOptions[cleanKey] = value;
      } else {
        config.interface[cleanKey] = value;
      }
    } else if (currentSection === 'peer') {
      const peer = config.peers[config.peers.length - 1];
      if (['jc', 'jmin', 'jmax', 's1', 's2', 'h1', 'h2', 'h3', 'h4'].includes(cleanKey)) {
        peer.amneziaOptions[cleanKey] = value;
      } else if (cleanKey === 'presharedkey') {
        peer.presharedKey = value; // Добавляем обработку PresharedKey
      } else {
        peer[cleanKey] = value;
      }
    }
  });

  return config;
}

function convertToClashProxy(wgConfig, fileName) {
  const interfaceData = wgConfig.interface;
  const peerData = wgConfig.peers[0];
  const dnsList = interfaceData.dns ? interfaceData.dns.split(',').map(d => d.trim()) : [];
  const defaultAmnezia = generateAmneziaDefaults();
  let proxyName = peerData.name || fileName.replace('.conf', '');
  let originalName = proxyName;
  
  if (!proxyName) {
    proxyName = `Random_${Math.random().toString(36).substr(2, 5)}`;
  } else {
    proxyName = proxyName.replace(/FREE#?/g, '');
    proxyName = proxyName.replace(/-$/, '');
    
    const flagMatch = proxyName.match(/^([A-Z]{2})[-_]/);
    if (flagMatch && COUNTRY_FLAGS[flagMatch[1]]) {
      proxyName = proxyName.replace(flagMatch[1], COUNTRY_FLAGS[flagMatch[1]]);
    }
  }

  const amneziaOptions = {};
  for (const key of ['jc', 'jmin', 'jmax', 's1', 's2', 'h1', 'h2', 'h3', 'h4']) {
    const interfaceValue = interfaceData.amneziaOptions[key];
    const peerValue = peerData.amneziaOptions[key];
    amneziaOptions[key] = interfaceValue || peerValue || defaultAmnezia[key];
  }

  return {
    name: proxyName,
    originalName: originalName,
    type: "wireguard",
    server: peerData.endpoint.split(':')[0],
    port: parseInt(peerData.endpoint.split(':')[1]),
    ip: interfaceData.address.split('/')[0],
    private_key: interfaceData.privatekey,
    public_key: peerData.publickey,
    preshared_key: peerData.presharedKey, // Добавляем PresharedKey в выходные данные
    allowed_ips: peerData.allowedips.split(',').map(ip => `'${ip.trim()}'`),
    udp: true,
    mtu: 1420,
    remote_dns_resolve: true,
    dns: dnsList,
    'amnezia-wg-option': amneziaOptions,
    isDefaultAmnezia: !(interfaceData.amneziaOptions.jc || peerData.amneziaOptions.jc)
  };
}

function generateAmneziaOptionsYAML(options) {
      const nojunkEnabled = document.getElementById('nojunk').checked;
	  const awg15Enabled = document.getElementById('awg15').checked;  
	  let yaml = '  amnezia-wg-option:\n';
	  if (nojunkEnabled) {} else {
      for (const [key, value] of Object.entries(options)) {
        yaml += `    ${key}: ${value}\n`;
      }}
	  if (awg15Enabled) {
		yaml += `    i1: <b 0xc6000000010843290a47ba8ba2ed000044d0e3efd9326adb60561baa3bc4b52471b2d459ddcc9a508dffddc97e4d40d811d3de7bc98cf06ea85902361ca3ae66b2a99c7de96f0ace4ba4710658aefde6dec6837bc1a48f47bbd63c6e60ff494d3e1bea5f13927922401c40b0f4570d26be6806b506a9ff5f75ca86fae5f8175d4b6bfd418df9b922cdff8e60b06decfe66f2b07da61a47b5c8b32fa999d8feac21c8878b6e15ee03b8388b2afd9ffd3b46753b0284907b10747e526eebf287ff08735929c4c5e4784a5e2ad3dd8ac8200d0e99ad1219e54060ddc72813e8a3e2291ac713c5f3251c5d748fd68782a2e8eb0c021e437a79aafb253efae3ee72e1051b647c45b676d3b9e474d4f60c7bf7d328106cb94f67eaf2c991cd7043371debbf2b4159b8f80f5da0e1b18f4da35fca0a88026b375f1082731d1cbbe9ba3ae2bfefec250ee328ded7f8330d4cda38f74a7fe10b58ace936fc83cfcb3e1ebed520f7559549a8f20568a248e16949611057a3dd9952bae9b7be518c2b5b2568b8582c165c73a6e8f9b042ec9702704a94dd99893421310d43ffc9caf003ff5fc7bcd718f3fa99d663a8bbad6b595ec1d4cf3c0ed1668d0541c4e5b7e5ded40c6628eb64b29f514424d08d8522ddf7b856e9b820441907177a3dbd9b958172173be8c45c8c7b1816fe4d24927f9b12778153fc118194786c6cf49bc5cf09177f73be27917a239592f9acd9a21150abbd1ca93b1e305dc64d9883429a032c3179e0639592c248cbacec00c90bfb5d5eaf8920bf80c47085a490ead8d0af45f6754e8ae5692f86be02c480ca2a1e6156dccf1bcb5c911c05e3c3a946ca23461669c57d287dcfa9dd187fc6a58394f0b2878c07e1d8cb6be41725d49c118e9ddbe1ae6e5d1a04b36ad98a24f0378deea84febb60b22dc81d8377fb3f21069d83e90b9eba2b6b0ea95acf5fd0482a00d064a9b73e0b3732fde45404e22349a514151381fc6095a8204234359c28765e360a57eb222418b11be704651e4da1b52b135d31ba63a7f06a0f7b8b6177f9bd02fb517877a1340e59d8dbe52ea8135bc80b2aa1959539803a31720ac949c7bf0785c2e413e8b83dd4fd40d8a63fbd832ecb727d0c0df04ce10dac6a7d6d75e264aaf856e7485cc2c4e1749f169e5ad4de6f89a2333e362910dd0d962e3bf59a353df5760fd15956fe32e40f863ea020e9709aa9a9ebeffc885e64231dc6fc384bc6a9e7e5c64c0eaf39f9f14a13658883ee8dd94737cb3a8c2f7020bfacb80f0122866635873e248e22b5a5abc84d507e1720d3fb5f827d75c1d39235a361a217eb0587d1639b0b31aef1fe91958220fcf934c2517dea2f1afe51cd63ac31b5f9323a427c36a5442f8a89b7494f1592666f62be0d8cf67fdf5ef38fafc55b7b4f569a105dfa9925f0a41913c6ee13064d4b83f9ee1c3231c402d68a624e2388e357144be99197dcafb92118d9a9ec6fe832771e12448a146fb5b9620a4718070b368aab646b03cce41ec4d5d9a9c880a9cff06aba991cc0845030abbac87c67255f0373eb38444a51d0958e57c7a33042697465c84abe6791cb8f28e484c4cd04f10791ad911b0dcc217f66cb3aa5fcdbb1e2be88139c4ac2652e469122408feba59ad04f66eb8ab8c80aaf10c2ec1f80b5be111d3ccc832df2395a947e335e7908fda5dcdaa14a61f0fa7156c94b1c96e5c191d850e341adc2e22c8f69fcfa5c3e403eadc933f18be3734bc345def4f40ea3e12>
\n`;  
	  }
      return yaml;
    }

function generateProxyGroups(proxies) {
  const groups = [];
  const protonProxies = [];
  const otherProxies = [];

  proxies.forEach(proxy => {
    const isProton = /(^|[_-])([A-Z]{2})([-_]FREE)?([#_-]|$)/i.test(proxy.originalName || proxy.name);
    
    if (isProton) {
      protonProxies.push(proxy.name);
    } else {
      otherProxies.push(proxy.name);
    }
  });

  if (protonProxies.length > 0) {
    groups.push(`
- name: Proton
  type: select
  icon: https://res.cloudinary.com/dbulfrlrz/image/upload/v1703162849/static/logos/icons/vpn_f9embt.svg
  proxies:
    - ${protonProxies.join('\n    - ')}
  url: 'http://speed.cloudflare.com/'
  unified-delay: true
  interval: 300`);
  }

  if (otherProxies.length > 0) {
    groups.push(`
- name: Other
  type: select
  icon: https://raw.githubusercontent.com/zaeboba/page/refs/heads/main/archive/amnezia.svg
  proxies:
    - ${otherProxies.join('\n    - ')}
  url: 'http://speed.cloudflare.com/'
  unified-delay: true
  interval: 300`);
  }

  return groups.join('\n');
}

function convert() {
  const files = document.getElementById('wgFiles').files;
  if (!files.length) return alert('Выберите файлы .conf');

  const selectedOption = document.querySelector('input[name="option"]:checked').id;
  enableToggles();
  
  proxyList = [];
  document.getElementById('fileList').innerHTML = `Обрабатываются файлы: ${Array.from(files).map(f => f.name).join(', ')}`;
  let filesProcessed = 0;
  
  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function() {
      try {
        const wgConfig = parseWGConfig(reader.result);
        const proxy = convertToClashProxy(wgConfig, file.name);
        proxyList.push(proxy);
        filesProcessed++;
        if (filesProcessed === files.length) {
          switch(selectedOption) {
            case 'clash':
              generateClashYaml();
              break;
            case 'awg':
              generateAWGYaml();
              break;
            case 'karing':
              generateKaringYaml();
              break;
            default:
              generateClashYaml();
          }
        }
      } catch (e) {
        alert(`Ошибка в файле ${file.name}: ${e.message}`);
        filesProcessed++; 
        if (filesProcessed === files.length) {
          generateClashYaml();
        }
      }
    };
    reader.onerror = function() {
      alert(`Ошибка чтения файла ${file.name}`);
      filesProcessed++;
      if (filesProcessed === files.length) {
        generateClashYaml();
      }
    };
    reader.readAsText(file);
  });
}

function generateClashYaml() {
  if (proxyList.length === 0) {
    alert('Не удалось обработать ни один файл');
    return;
  }




  const yamlProxies = proxyList.map(proxy => {
    let yaml = `- name: ${proxy.name}\n`;
    yaml += `  type: ${proxy.type}\n`;
    yaml += `  server: ${proxy.server}\n`;
    yaml += `  port: ${proxy.port}\n`;
    yaml += `  ip: ${proxy.ip}\n`;
    yaml += `  private-key: ${proxy.private_key}\n`;
    yaml += `  public-key: ${proxy.public_key}\n`;
    yaml += `  allowed-ips: [${proxy.allowed_ips.join(', ')}]\n`;
	if (proxy.preshared_key) {
    yaml += `  pre-shared-key: ${proxy.preshared_key}\n`;}
    yaml += `  udp: ${proxy.udp}\n`;
    yaml += `  mtu: ${proxy.mtu}\n`;
    yaml += `  remote-dns-resolve: ${proxy.remote_dns_resolve}\n`;
    yaml += `  dns: [${proxy.dns.join(', ')}]\n`;
    yaml += generateAmneziaOptionsYAML(proxy['amnezia-wg-option'], proxy.isDefaultAmnezia);
    return yaml;
  }).join('\n');

  const proxyGroups = generateProxyGroups(proxyList);
  const fullYaml = `proxies:\n${yamlProxies}\nproxy-groups:${proxyGroups}`;
  
  document.getElementById('yamlOutput').value = fullYaml;
  document.getElementById('downloadBtn').classList.remove('hidden');
  document.getElementById('copyBtn').classList.remove('hidden');
  document.getElementById('btn-cont').classList.remove('hidden');
  document.getElementById('downloadBtn').onclick = () => downloadYAML(fullYaml, 'clash-config.yaml');
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(fullYaml)
      .then(() => alert('Конфиг скопирован в буфер обмена!'))
      .catch(err => alert('Не удалось скопировать: ', err));
  };
}

function generateAWGYaml() {
  if (proxyList.length === 0) {
    alert('Не удалось обработать ни один файл');
    return;
  }

  const awgConfigs = proxyList.map(proxy => generateSingleAWGConfig(proxy));
  const finalOutput = awgConfigs.join('\n\n');

  document.getElementById('yamlOutput').value = finalOutput;
  document.getElementById('downloadBtn').classList.remove('hidden');
  document.getElementById('downloadBtn').onclick = downloadAWGConfigs;
  document.getElementById('copyBtn').classList.remove('hidden');
  document.getElementById('btn-cont').classList.remove('hidden');
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(fullYaml)
      .then(() => alert('Конфиг скопирован в буфер обмена!'))
      .catch(err => alert('Не удалось скопировать: ', err));
  };
}

function generateKaringYaml() {
  if (proxyList.length === 0) {
    alert('Не удалось обработать ни один файл');
    return;
  }

  const fakeOption = document.querySelector('input[name="fake"]:checked').id;
  let fakePackets, fakePacketsSize, fakePacketsDelay;

  switch(fakeOption) {
    case 'fake1':
      fakePackets = "3";
      fakePacketsSize = "1";
      fakePacketsDelay = "3";
      break;
    case 'fake2':
      fakePackets = "1-10";
      fakePacketsSize = "10-30";
      fakePacketsDelay = "10-30";
      break;
    case 'fake3':
      fakePackets = document.getElementById('fp1').value || "5-10";
      fakePacketsSize = document.getElementById('fps1').value || "40-100";
      fakePacketsDelay = document.getElementById('fpd1').value || "20-250";
      break;
    default:
      fakePackets = "5-10";
      fakePacketsSize = "40-100";
      fakePacketsDelay = "20-250";
  }

  const outbounds = proxyList.map(proxy => ({
    "type": "wireguard",
    "tag": proxy.name,
    "local_address": [`${proxy.ip}/32`],
    "private_key": proxy.private_key,
    "peer_public_key": proxy.public_key,
    "mtu": proxy.mtu,
    "fake_packets": fakePackets,
    "fake_packets_size": fakePacketsSize,
    "fake_packets_delay": fakePacketsDelay,
    "fake_packets_mode": "m4",
    "server": proxy.server,
    "server_port": proxy.port
  }));
  const karingConfig = {
    "outbounds": outbounds
  };

  const fullYaml = JSON.stringify(karingConfig, null, 2);
  document.getElementById('yamlOutput').value = fullYaml;
  document.getElementById('downloadBtn').classList.remove('hidden');
  document.getElementById('copyBtn').classList.remove('hidden');
    document.getElementById('btn-cont').classList.remove('hidden');
  document.getElementById('downloadBtn').onclick = () => downloadYAML(fullYaml, 'karing-config.json');
  document.getElementById('copyBtn').onclick = () => {
    navigator.clipboard.writeText(fullYaml)
      .then(() => alert('Конфиг скопирован в буфер обмена!'))
      .catch(err => alert('Не удалось скопировать: ', err));
  };
}

function downloadYAML(yamlContent, fileName) {
  const blob = new Blob([yamlContent], { type: 'text/yaml; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'config.yaml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAWGConfigs() {
  if (proxyList.length === 0) return;
  const downloadFrame = document.createElement('iframe');
  downloadFrame.style.display = 'none';
  document.body.appendChild(downloadFrame);
  proxyList.forEach((proxy, index) => {
    setTimeout(() => {
      const awgConfig = generateSingleAWGConfig(proxy);
      const fileName = getAWGFileName(proxy, index);
      
      const blob = new Blob([awgConfig], { type: 'application/x-config; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      downloadFrame.contentDocument.body.appendChild(link);
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    }, 1000 * index);
  });
  setTimeout(() => {
    document.body.removeChild(downloadFrame);
  }, 1000 * proxyList.length + 1000);
}

function generateSingleAWGConfig(proxy) {
  const amneziaOptions = proxy['amnezia-wg-option'];
  const awg15Enabled = document.getElementById('awg15').checked;
  const nojunkEnabled = document.getElementById('nojunk').checked;
  
  let awgConfig = '';
  
  if (proxy.originalName) {
    awgConfig += `# ${proxy.originalName}\n`;
  } else {
    awgConfig += `# Безымянный конфиг\n`;
  }
  
  awgConfig += `[Interface]\n`;
  awgConfig += `PrivateKey = ${proxy.private_key}\n`;
  awgConfig += `Address = ${proxy.ip}\n`;
  
  if (proxy.dns && proxy.dns.length > 0) {
    awgConfig += `DNS = ${proxy.dns.join(', ')}\n`;
  }
  
  awgConfig += `MTU = ${proxy.mtu}\n`;
  if (nojunkEnabled) {} else {
  awgConfig += `Jc = ${amneziaOptions.jc}\n`;
  awgConfig += `Jmin = ${amneziaOptions.jmin}\n`;
  awgConfig += `Jmax = ${amneziaOptions.jmax}\n`;
  awgConfig += `H1 = ${amneziaOptions.h1}\n`;
  awgConfig += `H2 = ${amneziaOptions.h2}\n`;
  awgConfig += `H3 = ${amneziaOptions.h3}\n`;
  awgConfig += `H4 = ${amneziaOptions.h4}\n`;
  }
  if (awg15Enabled) {
  awgConfig += `I1 = <b0xc6000000010843290a47ba8ba2ed000044d0e3efd9326adb60561baa3bc4b52471b2d459ddcc9a508dffddc97e4d40d811d3de7bc98cf06ea85902361ca3ae66b2a99c7de96f0ace4ba4710658aefde6dec6837bc1a48f47bbd63c6e60ff494d3e1bea5f13927922401c40b0f4570d26be6806b506a9ff5f75ca86fae5f8175d4b6bfd418df9b922cdff8e60b06decfe66f2b07da61a47b5c8b32fa999d8feac21c8878b6e15ee03b8388b2afd9ffd3b46753b0284907b10747e526eebf287ff08735929c4c5e4784a5e2ad3dd8ac8200d0e99ad1219e54060ddc72813e8a3e2291ac713c5f3251c5d748fd68782a2e8eb0c021e437a79aafb253efae3ee72e1051b647c45b676d3b9e474d4f60c7bf7d328106cb94f67eaf2c991cd7043371debbf2b4159b8f80f5da0e1b18f4da35fca0a88026b375f1082731d1cbbe9ba3ae2bfefec250ee328ded7f8330d4cda38f74a7fe10b58ace936fc83cfcb3e1ebed520f7559549a8f20568a248e16949611057a3dd9952bae9b7be518c2b5b2568b8582c165c73a6e8f9b042ec9702704a94dd99893421310d43ffc9caf003ff5fc7bcd718f3fa99d663a8bbad6b595ec1d4cf3c0ed1668d0541c4e5b7e5ded40c6628eb64b29f514424d08d8522ddf7b856e9b820441907177a3dbd9b958172173be8c45c8c7b1816fe4d24927f9b12778153fc118194786c6cf49bc5cf09177f73be27917a239592f9acd9a21150abbd1ca93b1e305dc64d9883429a032c3179e0639592c248cbacec00c90bfb5d5eaf8920bf80c47085a490ead8d0af45f6754e8ae5692f86be02c480ca2a1e6156dccf1bcb5c911c05e3c3a946ca23461669c57d287dcfa9dd187fc6a58394f0b2878c07e1d8cb6be41725d49c118e9ddbe1ae6e5d1a04b36ad98a24f0378deea84febb60b22dc81d8377fb3f21069d83e90b9eba2b6b0ea95acf5fd0482a00d064a9b73e0b3732fde45404e22349a514151381fc6095a8204234359c28765e360a57eb222418b11be704651e4da1b52b135d31ba63a7f06a0f7b8b6177f9bd02fb517877a1340e59d8dbe52ea8135bc80b2aa1959539803a31720ac949c7bf0785c2e413e8b83dd4fd40d8a63fbd832ecb727d0c0df04ce10dac6a7d6d75e264aaf856e7485cc2c4e1749f169e5ad4de6f89a2333e362910dd0d962e3bf59a353df5760fd15956fe32e40f863ea020e9709aa9a9ebeffc885e64231dc6fc384bc6a9e7e5c64c0eaf39f9f14a13658883ee8dd94737cb3a8c2f7020bfacb80f0122866635873e248e22b5a5abc84d507e1720d3fb5f827d75c1d39235a361a217eb0587d1639b0b31aef1fe91958220fcf934c2517dea2f1afe51cd63ac31b5f9323a427c36a5442f8a89b7494f1592666f62be0d8cf67fdf5ef38fafc55b7b4f569a105dfa9925f0a41913c6ee13064d4b83f9ee1c3231c402d68a624e2388e357144be99197dcafb92118d9a9ec6fe832771e12448a146fb5b9620a4718070b368aab646b03cce41ec4d5d9a9c880a9cff06aba991cc0845030abbac87c67255f0373eb38444a51d0958e57c7a33042697465c84abe6791cb8f28e484c4cd04f10791ad911b0dcc217f66cb3aa5fcdbb1e2be88139c4ac2652e469122408feba59ad04f66eb8ab8c80aaf10c2ec1f80b5be111d3ccc832df2395a947e335e7908fda5dcdaa14a61f0fa7156c94b1c96e5c191d850e341adc2e22c8f69fcfa5c3e403eadc933f18be3734bc345def4f40ea3e12>\n`;
  }
  awgConfig += `\n[Peer]\n`;
  awgConfig += `PublicKey = ${proxy.public_key}\n`;
  if (proxy.preshared_key) {
  awgConfig += `PresharedKey = ${proxy.preshared_key}\n`;}
  awgConfig += `AllowedIPs = ${proxy.allowed_ips.join(', ').replace(/'/g, '')}\n`;
  awgConfig += `Endpoint = ${proxy.server}:${proxy.port}\n`;
  
  return awgConfig;
}

function getAWGFileName(proxy, index) {
  if (proxy.originalName) {
    const cleanedName = proxy.originalName.replace(/-FREE/g, '');
    return `${cleanedName.replace(/[^a-z0-9]/gi, '_')}.conf`;
  }
  return `config_${index + 1}.conf`;
}

function fallbackDownload(proxies) {
  proxies.forEach((proxy, index) => {
    const awgConfig = generateSingleAWGConfig(proxy);
    const fileName = getAWGFileName(proxy, index);
    
    const blob = new Blob([awgConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100 * index);
  });
}

function replaceMobileText() {
    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

    // Заменяем подписи к полям ввода
    const labels = document.querySelectorAll('.musor2 .jc');
    labels[0].previousSibling.textContent = "fake_packets = ";
    labels[1].previousSibling.textContent = "fake_packets_size = ";
    labels[2].previousSibling.textContent = "fake_packets_delay = ";
}

// Вызываем при загрузке и при изменении размера окна
window.addEventListener('DOMContentLoaded', replaceMobileText);
window.addEventListener('resize', replaceMobileText);

function enableToggles() {
  const selectedOption = document.querySelector('input[name="option"]:checked').id;
  const awg15Toggle = document.getElementById('awg15');
  const nojunkToggle = document.getElementById('nojunk');
  
  // Активируем toggle только для clash и awg
  if (selectedOption === 'clash' || selectedOption === 'awg') {
    awg15Toggle.disabled = false;
    nojunkToggle.disabled = false;
  } else {
    awg15Toggle.disabled = true;
    nojunkToggle.disabled = true;
    // Сбрасываем состояние переключателей
    awg15Toggle.checked = false;
    nojunkToggle.checked = false;
  }
}

['awg15', 'nojunk', 'clash', 'awg', 'karing', 'fake1', 'fake2', 'fake3', 'junk1', 'junk2', 'junk3'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', function() {
        if (!this.disabled) convert();
    });
});
