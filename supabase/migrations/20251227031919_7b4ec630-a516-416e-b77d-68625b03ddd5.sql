-- Fix the search_path for the get_young_walker_age function (takes date, not uuid)
ALTER FUNCTION public.get_young_walker_age(date) SET search_path = public;