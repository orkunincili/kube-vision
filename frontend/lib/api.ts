export async function fetchNodes() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/nodes`, { cache: "no-store" });
  if (!res.ok) throw new Error(`nodes fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPods() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/pods`, { cache: "no-store" });
  if (!res.ok) throw new Error(`podes fetch failed: ${res.status}`);
  return res.json();
}
export async function fetchDeployments() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/deployments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`deployments fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchServices() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/services`, { cache: "no-store" });
  if (!res.ok) throw new Error(`services fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchIngresses() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL missing");

  const res = await fetch(`${base}/ingresses`, { cache: "no-store" });
  if (!res.ok) throw new Error(`ingresses fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchSummary() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${base}/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Fetch failed");
  
  const data = await res.json();

  // Backend'deki map'ten statüleri çekiyoruz (Cards için)
  const getStatus = (statusName: string) => data.pod_status?.[statusName] || 0;

  return {
    
    totalPods: data.pod_count || 0,
    runningPods: getStatus("Running"),
    pendingPods: getStatus("Pending"),
    failedPods: getStatus("Failed") + getStatus("Error") + getStatus("ImagePullBackOff") + getStatus("CrashLoopBackOff") + getStatus("ErrImagePull") + getStatus("CreateContainerConfigError"),
    
    totalNodes: data.node.length,
    node: data.node || [], 
    totalServices: data.service_count || 0,
    totalIngresses: data.ingress_count || 0,
   
  };
}