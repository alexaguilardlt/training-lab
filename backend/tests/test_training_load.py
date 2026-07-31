from app.services.training_load import calculate_acwr

def test_constant_load_gives_ratio_one():
  daily_loads = [100.0] * 35
  results = calculate_acwr(daily_loads)
  assert results[34]["ratio"] == 1.0

def test_first_27_days_gives_none_ratio():
  daily_loads = [100.0] * 35
  results = calculate_acwr(daily_loads)
  assert all(day["ratio"] is None for day in results[:27])

def test_spike_after_baseline_increases_ratio():
  daily_loads = [50.0] * 34 + [200.0]
  results = calculate_acwr(daily_loads)
  assert results[34]["ratio"] > 1.0
