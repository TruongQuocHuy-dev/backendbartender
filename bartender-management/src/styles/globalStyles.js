import { StyleSheet } from 'react';
import { COLORS } from '../utils/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebar: {
    width: 250,
    backgroundColor: COLORS.CARD,
    paddingVertical: 20,
  },
  sidebarItem: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  card: {
    backgroundColor: COLORS.CARD,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  title: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.SUBTEXT,
    fontSize: 14,
  },
});